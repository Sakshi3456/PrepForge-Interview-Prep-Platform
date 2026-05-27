package com.prepforge.backend.controller;

import com.prepforge.backend.dto.request.UpdateProfileRequest;
import com.prepforge.backend.dto.response.ProfileDto;
import com.prepforge.backend.entity.User;
import com.prepforge.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService service;

    @GetMapping("/{userId}")
    public ProfileDto getProfile(@PathVariable Long userId) {
        return service.getProfile(userId);
    }

    @PutMapping("/{userId}")
    public User updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest req) {
        return service.updateProfile(userId, req);
    }
}
