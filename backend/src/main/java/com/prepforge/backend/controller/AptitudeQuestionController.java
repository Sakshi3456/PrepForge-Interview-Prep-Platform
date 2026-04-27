package com.prepforge.backend.controller;

import com.prepforge.backend.entity.AptitudeQuestion;
import com.prepforge.backend.service.AptitudeQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aptitude")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class AptitudeQuestionController {

    private final AptitudeQuestionService service;

    @GetMapping
    public List<AptitudeQuestion> getAll() {
        return service.getAll();
    }

    @PostMapping
    public AptitudeQuestion add(@RequestBody AptitudeQuestion question) {
        return service.add(question);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted Successfully";
    }
}
