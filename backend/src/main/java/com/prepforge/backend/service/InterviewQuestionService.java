package com.prepforge.backend.service;

import com.prepforge.backend.entity.InterviewQuestion;
import com.prepforge.backend.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class InterviewQuestionService {

    private final InterviewQuestionRepository repository;

    public List<InterviewQuestion> getAll() {
        return repository.findAll();
    }

    public InterviewQuestion add(InterviewQuestion question) {
        return repository.save(question);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<InterviewQuestion> filter(String category, String difficulty) {
        if (category != null && difficulty != null) {
            return repository.findByCategoryAndDifficulty(category, difficulty);
        } else if (category != null) {
            return repository.findByCategory(category);
        } else if (difficulty != null) {
            return repository.findByDifficulty(difficulty);
        } else {
            return repository.findAll();
        }
    }

    public List<InterviewQuestion> search(String keyword) {
        return repository.findByQuestionContainingIgnoreCase(keyword);
    }

    public InterviewQuestion getRandom(String category) {
        List<InterviewQuestion> list =
                (category != null) ? repository.findByCategory(category) : repository.findAll();

        if (list.isEmpty()) throw new RuntimeException("No questions found");

        return list.get(new Random().nextInt(list.size()));
    }

    public InterviewQuestion toggleFavorite(Long id) {
        InterviewQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        q.setIsFavorite(!q.getIsFavorite());
        return repository.save(q);
    }

    public InterviewQuestion update(Long id, InterviewQuestion updated) {
        InterviewQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        q.setCategory(updated.getCategory());
        q.setQuestion(updated.getQuestion());
        q.setAnswer(updated.getAnswer());
        q.setDifficulty(updated.getDifficulty());         // ADD
        q.setCompanyTag(updated.getCompanyTag());          // ADD
        q.setFrequentlyAsked(updated.getFrequentlyAsked()); // ADD

        return repository.save(q);
    }
}