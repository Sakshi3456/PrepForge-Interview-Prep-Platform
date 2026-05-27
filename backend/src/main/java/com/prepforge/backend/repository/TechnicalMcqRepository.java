package com.prepforge.backend.repository;

import com.prepforge.backend.entity.TechnicalMcq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechnicalMcqRepository extends JpaRepository<TechnicalMcq, Long> {

    List<TechnicalMcq> findByCategory(String category);

    List<TechnicalMcq> findByCategoryAndDifficulty(String category, String difficulty);

    List<TechnicalMcq> findByDifficulty(String difficulty);

    List<TechnicalMcq> findByQuestionType(String questionType);

    List<TechnicalMcq> findByCategoryAndQuestionType(String category, String questionType);

    List<TechnicalMcq> findByFrequentlyAskedTrue();

    List<TechnicalMcq> findByQuestionContainingIgnoreCase(String keyword);
}
