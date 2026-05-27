package com.prepforge.backend.repository;

import com.prepforge.backend.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByCategory(String category);

    List<InterviewQuestion> findByDifficulty(String difficulty);

    List<InterviewQuestion> findByCategoryAndDifficulty(String category, String difficulty);

    List<InterviewQuestion> findByQuestionContainingIgnoreCase(String keyword);
}

