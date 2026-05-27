package com.prepforge.backend.controller;

import com.prepforge.backend.entity.QuizSession;
import com.prepforge.backend.service.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class QuizSessionController {

    private final QuizSessionService service;

    // Save quiz result after attempt
    @PostMapping("/save")
    public QuizSession save(@RequestBody QuizSession session) {
        return service.save(session);
    }

    // Get all quiz history for a user
    @GetMapping("/history/{userId}")
    public List<QuizSession> getHistory(@PathVariable Long userId) {
        return service.getHistory(userId);
    }

    // Get history by category
    @GetMapping("/history/{userId}/{category}")
    public List<QuizSession> getHistoryByCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        return service.getHistoryByCategory(userId, category);
    }

    // Leaderboard per category
    @GetMapping("/leaderboard/{category}")
    public List<QuizSession> getLeaderboard(@PathVariable String category) {
        return service.getLeaderboard(category);
    }
}
