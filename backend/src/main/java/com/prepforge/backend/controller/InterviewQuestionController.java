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
}