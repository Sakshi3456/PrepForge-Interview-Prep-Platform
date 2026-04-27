package com.prepforge.backend.repository;

import com.prepforge.backend.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {
}