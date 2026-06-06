package com.prepforge.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Send verification email ──
    public void sendVerificationEmail(String toEmail,
                                      String token) {
        String link = frontendUrl
                + "/verify-email?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("PrepForge — Verify Your Email");
        msg.setText(
                "Welcome to PrepForge!\n\n"
                        + "Please verify your email by clicking the link below:\n\n"
                        + link + "\n\n"
                        + "This link expires in 24 hours.\n\n"
                        + "If you didn't create an account, ignore this email."
        );
        mailSender.send(msg);
    }

    // ── Send password reset email ──
    public void sendPasswordResetEmail(String toEmail,
                                       String token) {
        String link = frontendUrl
                + "/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("PrepForge — Reset Your Password");
        msg.setText(
                "You requested a password reset.\n\n"
                        + "Click the link below to reset your password:\n\n"
                        + link + "\n\n"
                        + "This link expires in 1 hour.\n\n"
                        + "If you didn't request this, ignore this email."
        );
        mailSender.send(msg);
    }
}
