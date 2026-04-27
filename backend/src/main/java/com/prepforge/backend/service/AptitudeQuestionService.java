package com.prepforge.backend.service;

import com.prepforge.backend.entity.AptitudeQuestion;
import com.prepforge.backend.repository.AptitudeQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
