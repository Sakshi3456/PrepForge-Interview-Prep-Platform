package com.prepforge.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    // ── Groq model — configurable from application.properties ──
    @Value("${groq.model:llama-3.1-8b-instant}")
    private String model;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper  = new ObjectMapper();

    // ── Groq API endpoint (NOT Gemini) ──
    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    // ───────────────── MAIN METHOD ─────────────────
    public GroqResult getFeedback(String question, String userAnswer) {

        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return new GroqResult(0, "No answer provided.", "");
        }

        if (userAnswer.trim().split("\\s+").length < 3) {
            return new GroqResult(0,
                    "Answer too short to evaluate. Please provide a proper explanation.", "");
        }

        try {
            String prompt      = buildPrompt(question, userAnswer);
            String requestBody = buildRequestBody(prompt);

            System.out.println("Calling Groq API with model: " + model);

            String response = webClient.post()
                    .uri(GROQ_URL)
                    .header("Content-Type",  "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        System.out.println("Groq API Error: " + errorBody);
                                        return Mono.error(new RuntimeException(errorBody));
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

            System.out.println("Groq Raw Response: " + response);
            return parseResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            return new GroqResult(0, "AI feedback unavailable.", "");
        }
    }

    // ───────────────── RETRY METHOD ─────────────────
    public GroqResult getFeedbackWithRetry(String question, String userAnswer) {

        int maxRetries = 3;

        for (int i = 0; i < maxRetries; i++) {
            try {
                GroqResult result = getFeedback(question, userAnswer);
                if (result != null
                        && result.feedback != null
                        && !result.feedback.contains("unavailable")) {
                    return result;
                }
            } catch (RuntimeException e) {
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    System.out.println("Groq quota exceeded — skipping retries.");
                    return new GroqResult(0,
                            "AI feedback unavailable (quota exceeded).", "");
                }
            }

            System.out.println("Retrying Groq API... Attempt " + (i + 1));
            try { Thread.sleep(3000); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }

        return new GroqResult(0, "AI feedback unavailable after retries.", "");
    }

    // ───────────────── BUILD PROMPT ─────────────────
    private String buildPrompt(String question, String userAnswer) {
        return """
                You are a strict interview evaluator for software engineering roles.

                Question: %s

                Candidate's Answer: %s

                FIRST CHECK: Is the answer a genuine attempt to answer the question?
                - If the answer is just a programming language name (like "java", "python")
                - If the answer is random words, gibberish, or unrelated to the question
                - If the answer is less than 10 words and contains no real explanation
                THEN respond with score 0 and feedback "No valid answer provided."

                Only if it is a genuine attempt, evaluate it and respond ONLY with this exact JSON:

                {
                  "score": 7,
                  "feedback": "Your answer covers X but misses Y.",
                  "ideal_points": "Key points the answer should include."
                }

                Score Rules:
                0-3 = Very poor or invalid answer
                4-6 = Partial answer
                7-8 = Good answer
                9-10 = Excellent answer

                Respond ONLY with valid JSON. No markdown. No extra text.
                """.formatted(
                question.replace("\"", "'"),
                userAnswer.replace("\"", "'")
        );
    }

    // ───────────────── BUILD REQUEST BODY (Groq / OpenAI format) ─────────────────
    private String buildRequestBody(String prompt) {

        String escaped = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");

        return """
                {
                  "model": "%s",
                  "messages": [
                    {
                      "role": "user",
                      "content": "%s"
                    }
                  ],
                  "temperature": 0.3,
                  "max_tokens": 500
                }
                """.formatted(model, escaped);
    }

    // ───────────────── PARSE RESPONSE (Groq / OpenAI format) ─────────────────
    private GroqResult parseResponse(String response) {

        try {
            JsonNode root = mapper.readTree(response);

            // Groq uses OpenAI format: choices[0].message.content
            JsonNode choices = root.path("choices");

            if (!choices.isArray() || choices.size() == 0) {
                System.out.println("Invalid Groq response: " + response);
                return new GroqResult(0, "No AI response received.", "");
            }

            String text = choices.get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // Remove markdown fences if present
            text = text.replace("```json", "").replace("```", "").trim();

            System.out.println("Parsed Groq Text: " + text);

            JsonNode result = mapper.readTree(text);

            int    score       = result.path("score").asInt(0);
            String feedback    = result.path("feedback").asText("No feedback");
            String idealPoints = result.path("ideal_points").asText("");

            return new GroqResult(score, feedback, idealPoints);

        } catch (Exception e) {
            e.printStackTrace();
            return new GroqResult(0, "Could not parse AI feedback.", "");
        }
    }

    // ───────────────── RESULT DTO ─────────────────
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroqResult {
        public int    score;
        public String feedback;
        public String idealPoints;
    }
}