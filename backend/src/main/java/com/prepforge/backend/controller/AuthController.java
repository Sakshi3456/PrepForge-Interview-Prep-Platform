package com.prepforge.backend.controller;

import com.prepforge.backend.dto.response.LoginResponse;
import com.prepforge.backend.dto.request.LoginRequest;
import com.prepforge.backend.dto.request.RegisterRequest;
import com.prepforge.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
