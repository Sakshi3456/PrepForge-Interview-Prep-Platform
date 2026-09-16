package com.prepforge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${resend.api.key}")
    private String resendApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    // ── Send verification email ──
    public void sendVerificationEmail(String toEmail, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String text = "Welcome to PrepForge!\n\n"
                + "Please verify your email by clicking the link below:\n\n"
                + link + "\n\n"
                + "This link expires in 24 hours.\n\n"
                + "If you didn't create an account, ignore this email.";

        send(toEmail, "PrepForge — Verify Your Email", text);
    }

    // ── Send password reset email ──
    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String text = "You requested a password reset.\n\n"
                + "Click the link below to reset your password:\n\n"
                + link + "\n\n"
                + "This link expires in 1 hour.\n\n"
                + "If you didn't request this, ignore this email.";

        send(toEmail, "PrepForge — Reset Your Password", text);
    }

    // ── Core send method via Resend HTTPS API ──
    private void send(String toEmail, String subject, String text) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", "PrepForge <onboarding@resend.dev>",
                    "to", List.of(toEmail),
                    "subject", subject,
                    "text", text
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "Resend API error (" + response.statusCode() + "): "
                                + response.body());
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to send email via Resend: " + e.getMessage(), e);
        }
    }
}
