package com.prepforge.backend.repository;

import com.prepforge.backend.entity.AptitudeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AptitudeQuestionRepository
        extends JpaRepository<AptitudeQuestion, Long> {

    List<AptitudeQuestion> findByCategory(String category);

    List<AptitudeQuestion> findByCategoryAndDifficulty(String category, String difficulty);

    List<AptitudeQuestion> findByDifficulty(String difficulty);
}
