package com.prepforge.backend.controller;

import com.prepforge.backend.dto.request.SubmitRequest;
import com.prepforge.backend.dto.response.MockResultDto;
import com.prepforge.backend.dto.response.QuestionDto;
import com.prepforge.backend.entity.*;
import com.prepforge.backend.service.MockInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService service;

    @GetMapping("/sets")
    public List<InterviewSet> getAllSets() {
        return service.getAllSets();
    }

    @GetMapping("/sets/{id}")
    public InterviewSet getSet(@PathVariable Long id) {
        return service.getSet(id);
    }

    @GetMapping("/sets/{id}/questions")
    public List<QuestionDto> getQuestions(@PathVariable Long id) {
        return service.getQuestionsForSet(id);
    }

    @PostMapping("/sets")
    public InterviewSet createSet(@RequestBody InterviewSet set) {
        return service.createSet(set);
    }

    @PutMapping("/sets/{id}")
    public InterviewSet updateSet(
            @PathVariable Long id,
            @RequestBody InterviewSet updated) {
        return service.updateSet(id, updated);
    }

    @DeleteMapping("/sets/{id}")
    public String deleteSet(@PathVariable Long id) {
        service.deleteSet(id);
        return "Deleted";
    }

    @PostMapping("/sets/{id}/questions")
    public InterviewSetQuestion addQuestion(
            @PathVariable Long id,
            @RequestBody InterviewSetQuestion q) {
        return service.addQuestionToSet(id, q);
    }

    @DeleteMapping("/set-questions/{refId}")
    public String removeQuestion(@PathVariable Long refId) {
        service.removeQuestionFromSet(refId);
        return "Removed";
    }

    @PostMapping("/submit")
    public MockSession submit(
            @RequestBody SubmitRequest request) {
        return service.submitInterview(request);
    }

    @GetMapping("/history/{userId}")
    public List<MockSession> getHistory(
            @PathVariable Long userId) {
        return service.getHistory(userId);
    }

    @GetMapping("/result/{sessionId}")
    public MockResultDto getResult(
            @PathVariable Long sessionId) {
        return service.getResult(sessionId);
    }
}
