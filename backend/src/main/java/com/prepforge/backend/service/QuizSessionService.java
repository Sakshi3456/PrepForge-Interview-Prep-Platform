package com.prepforge.backend.service;

import com.prepforge.backend.entity.QuizSession;
import com.prepforge.backend.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizSessionService {

    private final QuizSessionRepository repository;

    public QuizSession save(QuizSession session) {
        // FIX: Ensure attemptedAt is never null before saving
        if (session.getAttemptedAt() == null) {
            session.setAttemptedAt(java.time.LocalDateTime.now());
        }

        session.setAccuracy(
                session.getTotal() > 0
                        ? (double) session.getScore() / session.getTotal() * 100
                        : 0.0
        );
        return repository.save(session);
    }

    public List<QuizSession> getHistory(Long userId) {
        return repository.findByUserIdOrderByAttemptedAtDesc(userId);
    }

    public List<QuizSession> getHistoryByCategory(Long userId, String category) {
        return repository.findByUserIdAndCategoryOrderByAttemptedAtDesc(userId, category);
    }

    public List<QuizSession> getLeaderboard(String category) {
        return repository.findTop10ByCategoryOrderByScoreDesc(category);
    }
}
