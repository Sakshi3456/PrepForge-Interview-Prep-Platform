package com.prepforge.backend.service;

import com.prepforge.backend.entity.McqSession;
import com.prepforge.backend.repository.McqSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class McqSessionService {

    private final McqSessionRepository repository;

    public McqSession save(McqSession session) {
        session.setAccuracy((double) session.getScore() / session.getTotal() * 100);
        return repository.save(session);
    }

    public List<McqSession> getHistory(Long userId) {
        return repository.findByUserIdOrderByAttemptedAtDesc(userId);
    }

    public List<McqSession> getHistoryByCategory(Long userId, String category) {
        return repository.findByUserIdAndCategoryOrderByAttemptedAtDesc(userId, category);
    }

    public List<McqSession> getLeaderboard(String category) {
        return repository.findTop10ByCategoryOrderByScoreDesc(category);
    }
}
