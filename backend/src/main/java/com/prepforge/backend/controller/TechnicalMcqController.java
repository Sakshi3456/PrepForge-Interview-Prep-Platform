package com.prepforge.backend.controller;

import com.prepforge.backend.entity.TechnicalMcq;
import com.prepforge.backend.service.TechnicalMcqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/mcq")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class TechnicalMcqController {

    private final TechnicalMcqService service;

    @GetMapping
    public List<TechnicalMcq> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TechnicalMcq getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public TechnicalMcq add(@RequestBody TechnicalMcq mcq) {
        return service.add(mcq);
    }

    @PutMapping("/{id}")
    public TechnicalMcq update(
            @PathVariable Long id,
            @RequestBody TechnicalMcq updated) {
        return service.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }

    @GetMapping("/filter")
    public List<TechnicalMcq> filter(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String questionType) {
        return service.filter(category, difficulty, questionType);
    }

    @GetMapping("/search")
    public List<TechnicalMcq> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    @GetMapping("/frequent")
    public List<TechnicalMcq> getFrequent() {
        return service.getFrequentlyAsked();
    }

    @GetMapping("/quiz")
    public List<TechnicalMcq> getQuiz(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "20") int count) {
        return service.getRandomQuiz(category, count);
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file) {
        try {
            List<TechnicalMcq> saved = service.bulkUpload(file);
            return ResponseEntity.ok("Uploaded " + saved.size() + " questions successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}
