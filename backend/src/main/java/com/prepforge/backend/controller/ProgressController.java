package com.prepforge.backend.controller;

import com.prepforge.backend.dto.response.ProgressDto;
import com.prepforge.backend.entity.UserStreak;
import com.prepforge.backend.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService service;

    // Get full progress for a user
    @GetMapping("/{userId}")
    public ProgressDto getProgress(@PathVariable Long userId) {
        return service.getProgress(userId);
    }

    // Update streak (call this whenever user does anything)
    @PostMapping("/streak/{userId}")
    public UserStreak updateStreak(@PathVariable Long userId) {
        return service.updateStreak(userId);
    }

    // Save interview question self assessment
    @PostMapping("/question")
    public void saveQuestionProgress(
            @RequestParam Long userId,
            @RequestParam Long questionId,
            @RequestParam String status) {
        service.saveQuestionProgress(userId, questionId, status);
    }

    // Save coding progress
    @PostMapping("/coding")
    public void saveCodingProgress(
            @RequestParam Long userId,
            @RequestParam Long questionId,
            @RequestParam String status) {
        service.saveCodingProgress(userId, questionId, status);
    }
}
