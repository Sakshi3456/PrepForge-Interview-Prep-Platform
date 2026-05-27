package com.prepforge.backend.repository;

import com.prepforge.backend.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {

    List<CodingQuestion> findByDifficulty(String difficulty);

    List<CodingQuestion> findByLanguage(String language);

    List<CodingQuestion> findByTopic(String topic);

    List<CodingQuestion> findByDifficultyAndLanguage(String difficulty, String language);

    List<CodingQuestion> findByDifficultyAndTopic(String difficulty, String topic);

    List<CodingQuestion> findByDifficultyAndLanguageAndTopic(
            String difficulty, String language, String topic
    );

    List<CodingQuestion> findByTitleContainingIgnoreCase(String keyword);

    List<CodingQuestion> findByCompanyTagsContainingIgnoreCase(String company);
}
