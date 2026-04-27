package com.prepforge.backend.controller;

import com.prepforge.backend.repository.NoteRepository;
import com.prepforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("users", userRepository.count());
        stats.put("notes", noteRepository.count());
        return stats;
    }
}
