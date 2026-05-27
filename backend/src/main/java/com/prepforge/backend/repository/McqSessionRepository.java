package com.prepforge.backend.repository;

import com.prepforge.backend.entity.McqSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface McqSessionRepository extends JpaRepository<McqSession, Long> {

    List<McqSession> findByUserIdOrderByAttemptedAtDesc(Long userId);

    List<McqSession> findByUserIdAndCategoryOrderByAttemptedAtDesc(Long userId, String category);

    List<McqSession> findTop10ByCategoryOrderByScoreDesc(String category);
}
