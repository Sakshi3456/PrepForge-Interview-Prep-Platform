package com.prepforge.backend.repository;

import com.prepforge.backend.entity.AptitudeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AptitudeQuestionRepository
        extends JpaRepository<AptitudeQuestion, Long> {
}
