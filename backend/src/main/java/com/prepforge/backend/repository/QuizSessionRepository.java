package com.prepforge.backend.repository;

import com.prepforge.backend.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    List<QuizSession> findByUserIdOrderByAttemptedAtDesc(Long userId);

    List<QuizSession> findByUserIdAndCategoryOrderByAttemptedAtDesc(Long userId, String category);

    // For leaderboard — top scores per category
    List<QuizSession> findTop10ByCategoryOrderByScoreDesc(String category);
}
