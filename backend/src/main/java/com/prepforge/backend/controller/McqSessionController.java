package com.prepforge.backend.controller;

import com.prepforge.backend.entity.McqSession;
import com.prepforge.backend.service.McqSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mcq-sessions")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class McqSessionController {

    private final McqSessionService service;

    @PostMapping("/save")
    public McqSession save(@RequestBody McqSession session) {
        return service.save(session);
    }

    @GetMapping("/history/{userId}")
    public List<McqSession> getHistory(@PathVariable Long userId) {
        return service.getHistory(userId);
    }

    @GetMapping("/history/{userId}/{category}")
    public List<McqSession> getHistoryByCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        return service.getHistoryByCategory(userId, category);
    }

    @GetMapping("/leaderboard/{category}")
    public List<McqSession> getLeaderboard(@PathVariable String category) {
        return service.getLeaderboard(category);
    }
}
