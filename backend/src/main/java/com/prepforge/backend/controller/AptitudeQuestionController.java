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

    @PutMapping("/{id}")
    public AptitudeQuestion update(
            @PathVariable Long id,
            @RequestBody AptitudeQuestion updated) {
        return service.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted Successfully";
    }

    @GetMapping("/filter")
    public List<AptitudeQuestion> filter(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        return service.filter(category, difficulty);
    }

    @GetMapping("/quiz")
    public List<AptitudeQuestion> getQuiz(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int count) {
        return service.getRandomQuiz(category, count);
    }
}
