package com.prepforge.backend.controller;

import com.prepforge.backend.dto.request.LoginRequest;
import com.prepforge.backend.dto.request.RegisterRequest;
import com.prepforge.backend.dto.response.LoginResponse;
import com.prepforge.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")

@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest req) {
        try {
            String msg = authService.register(req);
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest req) {
        try {
            LoginResponse res = authService.login(req);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

   /* @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(
            @RequestParam String token) {
        try {
            String msg = authService.verifyEmail(token);
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }*/

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody Map<String, String> body) {
        try {
            String msg = authService.forgotPassword(
                    body.get("email"));
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody Map<String, String> body) {
        try {
            String msg = authService.resetPassword(
                    body.get("token"),
                    body.get("password"));
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}