package com.prepforge.backend.service;

import com.prepforge.backend.entity.TechnicalMcq;
import com.prepforge.backend.repository.TechnicalMcqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicalMcqService {

    private final TechnicalMcqRepository repository;

    public List<TechnicalMcq> getAll() {
        return repository.findAll();
    }

    public TechnicalMcq getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public TechnicalMcq add(TechnicalMcq mcq) {
        return repository.save(mcq);
    }

    public TechnicalMcq update(Long id, TechnicalMcq updated) {
        TechnicalMcq q = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        q.setCategory(updated.getCategory());
        q.setDifficulty(updated.getDifficulty());
        q.setQuestionType(updated.getQuestionType());
        q.setQuestion(updated.getQuestion());
        q.setCodeSnippet(updated.getCodeSnippet());
        q.setOptionA(updated.getOptionA());
        q.setOptionB(updated.getOptionB());
        q.setOptionC(updated.getOptionC());
        q.setOptionD(updated.getOptionD());
        q.setCorrectAnswer(updated.getCorrectAnswer());
        q.setExplanation(updated.getExplanation());
        q.setFrequentlyAsked(updated.getFrequentlyAsked());

        return repository.save(q);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<TechnicalMcq> filter(
            String category, String difficulty, String questionType) {

        if (category != null && difficulty != null) {
            return repository.findByCategoryAndDifficulty(category, difficulty);
        } else if (category != null && questionType != null) {
            return repository.findByCategoryAndQuestionType(category, questionType);
        } else if (category != null) {
            return repository.findByCategory(category);
        } else if (difficulty != null) {
            return repository.findByDifficulty(difficulty);
        } else if (questionType != null) {
            return repository.findByQuestionType(questionType);
        }
        return repository.findAll();
    }

    public List<TechnicalMcq> search(String keyword) {
        return repository.findByQuestionContainingIgnoreCase(keyword);
    }

    public List<TechnicalMcq> getFrequentlyAsked() {
        return repository.findByFrequentlyAskedTrue();
    }

    // Random quiz — 20 questions from category
    public List<TechnicalMcq> getRandomQuiz(String category, int count) {
        List<TechnicalMcq> pool = (category != null && !category.equals("All"))
                ? repository.findByCategory(category)
                : repository.findAll();

        Collections.shuffle(pool);
        return pool.stream().limit(count).toList();
    }

    // CSV Bulk Upload
    // CSV format: category,difficulty,questionType,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,frequentlyAsked
    public List<TechnicalMcq> bulkUpload(MultipartFile file) {
        List<TechnicalMcq> saved = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                if (line.trim().isEmpty()) continue;

                String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (cols.length < 10) continue;

                TechnicalMcq q = new TechnicalMcq();
                q.setCategory(cols[0].trim());
                q.setDifficulty(cols[1].trim());
                q.setQuestionType(cols[2].trim());
                q.setQuestion(cols[3].trim().replace("\"", ""));
                q.setOptionA(cols[4].trim());
                q.setOptionB(cols[5].trim());
                q.setOptionC(cols[6].trim());
                q.setOptionD(cols[7].trim());
                q.setCorrectAnswer(cols[8].trim());
                q.setExplanation(cols.length > 9 ? cols[9].trim() : "");
                q.setFrequentlyAsked(cols.length > 10 && cols[10].trim().equalsIgnoreCase("true"));

                saved.add(repository.save(q));
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV upload failed: " + e.getMessage());
        }
        return saved;
    }
}
