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
public class GeminiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("llama-3.1-8b-instant")
    private String geminiModel;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    private String getUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent";
    }

    // ───────────────── MAIN METHOD ─────────────────
    public GeminiResult getFeedback(String question, String userAnswer) {

        // CHECK 1 — null or empty
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return new GeminiResult(
                    0,
                    "No answer provided.",
                    ""
            );
        }

        // CHECK 2 — too short to be a real answer (less than 3 words)
        if (userAnswer.trim().split("\\s+").length < 3) {
            return new GeminiResult(
                    0,
                    "Answer too short to evaluate. Please provide a proper explanation.",
                    ""
            );
        }

        try {

            String prompt = buildPrompt(question, userAnswer);
            String requestBody = buildRequestBody(prompt);

            System.out.println("Using model: " + geminiModel);
            System.out.println("Calling Gemini API...");

            String response = webClient.post()
                    .uri(getUrl() + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()

                    // HANDLE ERROR RESPONSES
                    .onStatus(
                            HttpStatusCode::isError,
                            clientResponse ->
                                    clientResponse.bodyToMono(String.class)
                                            .flatMap(errorBody -> {

                                                System.out.println("Gemini API Error:");
                                                System.out.println(errorBody);

                                                return Mono.error(
                                                        new RuntimeException(errorBody)
                                                );
                                            })
                    )

                    .bodyToMono(String.class)
                    .block();

            System.out.println("Gemini Raw Response:");
            System.out.println(response);

            return parseResponse(response);

        } catch (Exception e) {

            e.printStackTrace();

            return new GeminiResult(
                    0,
                    "AI feedback unavailable.",
                    ""
            );
        }
    }

    // ───────────────── RETRY METHOD ─────────────────
    public GeminiResult getFeedbackWithRetry(
            String question,
            String userAnswer
    ) {

        int maxRetries = 3;

        for (int i = 0; i < maxRetries; i++) {

            try {

                GeminiResult result = getFeedback(question, userAnswer);

                // SUCCESS
                if (result != null
                        && result.feedback != null
                        && !result.feedback.contains("unavailable")) {
                    return result;
                }

            } catch (RuntimeException e) {

                // DON'T retry on quota errors — it won't help
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    System.out.println("Quota exceeded — skipping retries.");
                    return new GeminiResult(
                            0,
                            "AI feedback unavailable (quota exceeded).",
                            ""
                    );
                }
            }

            System.out.println("Retrying Gemini API... Attempt " + (i + 1));

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        return new GeminiResult(
                0,
                "AI feedback unavailable after retries.",
                ""
        );
    }

    // ───────────────── BUILD PROMPT ─────────────────
    private String buildPrompt(
            String question,
            String userAnswer
    ) {

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

                Respond ONLY with valid JSON.
                No markdown.
                No extra text.
                """.formatted(
                question.replace("\"", "'"),
                userAnswer.replace("\"", "'")
        );
    }

    // ───────────────── REQUEST BODY ─────────────────
    private String buildRequestBody(String prompt) {

        String escaped = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");

        return """
                {
                  "contents": [{
                    "parts": [{
                      "text": "%s"
                    }]
                  }],
                  "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 500
                  }
                }
                """.formatted(escaped);
    }

    // ───────────────── PARSE RESPONSE ─────────────────
    private GeminiResult parseResponse(String response) {

        try {

            JsonNode root = mapper.readTree(response);

            JsonNode candidates = root.path("candidates");

            // SAFETY CHECK
            if (!candidates.isArray()
                    || candidates.size() == 0) {

                System.out.println("Invalid Gemini response:");
                System.out.println(response);

                return new GeminiResult(
                        0,
                        "No AI response received.",
                        ""
                );
            }

            String text = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            // REMOVE MARKDOWN
            text = text
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            System.out.println("Parsed AI Text:");
            System.out.println(text);

            JsonNode result = mapper.readTree(text);

            int score = result.path("score").asInt(0);

            String feedback =
                    result.path("feedback")
                            .asText("No feedback");

            String idealPoints =
                    result.path("ideal_points")
                            .asText("");

            return new GeminiResult(
                    score,
                    feedback,
                    idealPoints
            );

        } catch (Exception e) {

            e.printStackTrace();

            return new GeminiResult(
                    0,
                    "Could not parse AI feedback.",
                    ""
            );
        }
    }

    // ───────────────── RESULT DTO ─────────────────
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeminiResult {

        public int score;

        public String feedback;

        public String idealPoints;
    }
}