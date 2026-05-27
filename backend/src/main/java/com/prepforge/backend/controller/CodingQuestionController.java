package com.prepforge.backend.controller;

import com.prepforge.backend.entity.CodingQuestion;
import com.prepforge.backend.service.CodingQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class CodingQuestionController {

    private final CodingQuestionService service;

    // Get all
    @GetMapping
    public List<CodingQuestion> getAll() {
        return service.getAll();
    }

    // Get by ID
    @GetMapping("/{id}")
    public CodingQuestion getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Add
    @PostMapping
    public CodingQuestion add(@RequestBody CodingQuestion question) {
        return service.add(question);
    }

    // Update
    @PutMapping("/{id}")
    public CodingQuestion update(
            @PathVariable Long id,
            @RequestBody CodingQuestion updated) {
        return service.update(id, updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }

    // Filter by difficulty + language + topic
    @GetMapping("/filter")
    public List<CodingQuestion> filter(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String topic) {
        return service.filter(difficulty, language, topic);
    }

    // Search by title
    @GetMapping("/search")
    public List<CodingQuestion> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    // Get by company
    @GetMapping("/company")
    public List<CodingQuestion> getByCompany(@RequestParam String name) {
        return service.getByCompany(name);
    }

    // Toggle solved
    @PutMapping("/{id}/solved")
    public CodingQuestion toggleSolved(@PathVariable Long id) {
        return service.toggleSolved(id);
    }

    // Get similar problems
    @GetMapping("/{id}/similar")
    public List<CodingQuestion> getSimilar(@PathVariable Long id) {
        return service.getSimilar(id);
    }
}
