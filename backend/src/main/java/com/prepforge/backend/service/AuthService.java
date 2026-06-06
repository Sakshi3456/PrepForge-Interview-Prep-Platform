package com.prepforge.backend.service;

import com.prepforge.backend.dto.request.LoginRequest;
import com.prepforge.backend.dto.request.RegisterRequest;
import com.prepforge.backend.dto.response.LoginResponse;
import com.prepforge.backend.entity.User;
import com.prepforge.backend.repository.UserRepository;
import com.prepforge.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository  userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil         jwtUtil;
    private final EmailService    emailService;

    // ── Register ──
    public String register(RegisterRequest req) {

        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        validatePassword(req.getPassword());

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("USER");
        user.setAuthProvider("LOCAL");
        user.setEmailVerified(true); // TODO: set false after deployment

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        userRepo.save(user);

        // TODO: uncomment after deployment
        // emailService.sendVerificationEmail(user.getEmail(), token);

        return "Registration successful. You can now log in.";
    }

    // ── Login ──
    public LoginResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(
                        req.getEmail().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new RuntimeException(
                    "This account uses Google sign-in. "
                            + "Please use Continue with Google.");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException(
                    "Please verify your email before logging in. "
                            + "Check your inbox.");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole());

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ── Verify email ──
    // TODO: uncomment after deployment
    /*
    public String verifyEmail(String token) {
        User user = userRepo.findByVerificationToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid or expired token"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepo.save(user);
        return "Email verified successfully. You can now log in.";
    }
    */

    // ── Forgot password ──
    public String forgotPassword(String email) {
        User user = userRepo.findByEmail(
                        email.toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("No account found with this email"));

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new RuntimeException(
                    "This account uses Google sign-in. "
                            + "Password reset is not available.");
        }

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepo.save(user);

        // TODO: uncomment after deployment
        // emailService.sendPasswordResetEmail(user.getEmail(), token);

        return "Password reset link sent to your email.";
    }

    // ── Reset password ──
    public String resetPassword(String token, String newPassword) {
        User user = userRepo.findByResetPasswordToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid or expired token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Reset link has expired. Please request a new one.");
        }

        validatePassword(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);

        return "Password reset successfully. You can now log in.";
    }

    // ── Password strength validation ──
    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException(
                    "Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException(
                    "Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException(
                    "Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException(
                    "Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new RuntimeException(
                    "Password must contain at least one special character");
        }
    }
}
