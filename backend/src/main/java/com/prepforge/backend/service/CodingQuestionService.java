package com.prepforge.backend.service;

import com.prepforge.backend.entity.CodingQuestion;
import com.prepforge.backend.repository.CodingQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CodingQuestionService {

    private final CodingQuestionRepository repository;

    // ── Get All ──
    public List<CodingQuestion> getAll() {
        return repository.findAll();
    }

    // ── Get by ID ──
    public CodingQuestion getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    // ── Add ──
    public CodingQuestion add(CodingQuestion question) {
        return repository.save(question);
    }

    // ── Update ──
    public CodingQuestion update(Long id, CodingQuestion updated) {
        CodingQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        q.setTitle(updated.getTitle());
        q.setTopic(updated.getTopic());
        q.setDifficulty(updated.getDifficulty());
        q.setLanguage(updated.getLanguage());
        q.setProblemStatement(updated.getProblemStatement());
        q.setInputOutput(updated.getInputOutput());
        q.setHint(updated.getHint());
        q.setApproach(updated.getApproach());
        q.setSolution(updated.getSolution());
        q.setTimeComplexity(updated.getTimeComplexity());
        q.setSpaceComplexity(updated.getSpaceComplexity());
        q.setCompanyTags(updated.getCompanyTags());

        return repository.save(q);
    }

    // ── Delete ──
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // ── Filter by difficulty + language + topic ──
    public List<CodingQuestion> filter(
            String difficulty, String language, String topic) {

        if (difficulty != null && language != null && topic != null) {
            return repository.findByDifficultyAndLanguageAndTopic(difficulty, language, topic);
        } else if (difficulty != null && language != null) {
            return repository.findByDifficultyAndLanguage(difficulty, language);
        } else if (difficulty != null && topic != null) {
            return repository.findByDifficultyAndTopic(difficulty, topic);
        } else if (difficulty != null) {
            return repository.findByDifficulty(difficulty);
        } else if (language != null) {
            return repository.findByLanguage(language);
        } else if (topic != null) {
            return repository.findByTopic(topic);
        } else {
            return repository.findAll();
        }
    }

    // ── Search by title ──
    public List<CodingQuestion> search(String keyword) {
        return repository.findByTitleContainingIgnoreCase(keyword);
    }

    // ── Get by company tag ──
    public List<CodingQuestion> getByCompany(String company) {
        return repository.findByCompanyTagsContainingIgnoreCase(company);
    }

    // ── Toggle solved ──
    public CodingQuestion toggleSolved(Long id) {
        CodingQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        q.setIsSolved(!q.getIsSolved());
        return repository.save(q);
    }

    // ── Similar problems (same topic, different id) ──
    public List<CodingQuestion> getSimilar(Long id) {
        CodingQuestion q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        return repository.findByTopic(q.getTopic())
                .stream()
                .filter(item -> !item.getId().equals(id))
                .limit(3)
                .toList();
    }
}
