package com.prepforge.backend.service;

import com.prepforge.backend.entity.AptitudeQuestion;
import com.prepforge.backend.repository.AptitudeQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AptitudeQuestionService {

    private final AptitudeQuestionRepository repository;

    public List<AptitudeQuestion> getAll() {
        return repository.findAll();
    }

    public AptitudeQuestion add(AptitudeQuestion question) {
        return repository.save(question);
    }

    public AptitudeQuestion update(Long id, AptitudeQuestion updated) {
        AptitudeQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        q.setCategory(updated.getCategory());
        q.setDifficulty(updated.getDifficulty());
        q.setQuestion(updated.getQuestion());
        q.setOptionA(updated.getOptionA());
        q.setOptionB(updated.getOptionB());
        q.setOptionC(updated.getOptionC());
        q.setOptionD(updated.getOptionD());
        q.setCorrectAnswer(updated.getCorrectAnswer());
        q.setExplanation(updated.getExplanation());
        return repository.save(q);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<AptitudeQuestion> filter(String category, String difficulty) {
        if (category != null && difficulty != null) {
            return repository.findByCategoryAndDifficulty(category, difficulty);
        } else if (category != null) {
            return repository.findByCategory(category);
        } else if (difficulty != null) {
            return repository.findByDifficulty(difficulty);
        }
        return repository.findAll();
    }

    // Random 10 questions from a category
    public List<AptitudeQuestion> getRandomQuiz(String category, int count) {
        List<AptitudeQuestion> pool = (category != null && !category.equals("All"))
                ? repository.findByCategory(category)
                : repository.findAll();

        Collections.shuffle(pool);
        return pool.stream().limit(count).toList();
    }
}
