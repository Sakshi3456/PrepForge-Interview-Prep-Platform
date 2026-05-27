package com.prepforge.backend.controller;

import com.prepforge.backend.entity.InterviewQuestion;
import com.prepforge.backend.service.InterviewQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class InterviewQuestionController {

    private final InterviewQuestionService service;

    @GetMapping
    public List<InterviewQuestion> getAll() {
        return service.getAll();
    }

    @PostMapping
    public InterviewQuestion add(@RequestBody InterviewQuestion question) {
        return service.add(question);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted Successfully";
    }

    @PutMapping("/{id}")
    public InterviewQuestion update(
            @PathVariable Long id,
            @RequestBody InterviewQuestion updated
    ) {
        return service.update(id, updated);
    }

    @GetMapping("/filter")
    public List<InterviewQuestion> filter(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty
    ) {
        return service.filter(category, difficulty);
    }

    @GetMapping("/search")
    public List<InterviewQuestion> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    @GetMapping("/random")
    public InterviewQuestion random(@RequestParam(required = false) String category) {
        return service.getRandom(category);
    }

    @PutMapping("/{id}/favorite")
    public InterviewQuestion toggleFavorite(@PathVariable Long id) {
        return service.toggleFavorite(id);
    }
}