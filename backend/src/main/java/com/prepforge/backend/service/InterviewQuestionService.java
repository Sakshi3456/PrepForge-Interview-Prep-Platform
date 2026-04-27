package com.prepforge.backend.service;

import com.prepforge.backend.entity.InterviewQuestion;
import com.prepforge.backend.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
}