package com.prepforge.backend.controller;

import com.prepforge.backend.entity.Note;
import com.prepforge.backend.repository.NoteRepository;
import com.prepforge.backend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final NoteRepository noteRepository;

    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.getAllNotes();
    }

    @PostMapping
    public Note addNote(@RequestBody Note note) {
        return noteService.addNote(note);
    }

    @DeleteMapping("/{id}")
    public String deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return "Note Deleted Successfully";
    }

    @GetMapping("/search")
    public List<Note> searchNotes(@RequestParam String keyword) {
        return noteRepository
                .findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                        keyword,
                        keyword
                );
    }

    @PostMapping("/upload-file")
    public String uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("readTime") Integer readTime
    ) {
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            file.transferTo(new java.io.File(uploadDir + fileName));

            Note note = new Note();
            note.setTitle(title);
            note.setCategory(category);
            note.setDifficulty(difficulty);
            note.setReadTime(readTime);
            note.setContent("File uploaded");
            note.setFileName(fileName);

            if (file.getOriginalFilename().endsWith(".pdf")) {
                note.setFileType("PDF");
            } else {
                note.setFileType("CSV");
            }

            noteRepository.save(note);

            return "File uploaded";

        } catch (Exception e) {
            e.printStackTrace();
            return "Upload failed";
        }
    }

    @GetMapping("/file/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws Exception {

        Path path = Paths.get(System.getProperty("user.dir") + "/uploads/")
                .resolve(fileName);

        Resource resource = new UrlResource(path.toUri());

        String contentType = "application/octet-stream";

        if (fileName.endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (fileName.endsWith(".csv")) {
            contentType = "text/csv";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/file/{fileName}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) throws Exception {

        Path path = Paths.get(System.getProperty("user.dir") + "/uploads/")
                .resolve(fileName);

        Resource resource = new UrlResource(path.toUri());

        String contentType = "application/octet-stream";

        if (fileName.endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (fileName.endsWith(".csv")) {
            contentType = "text/csv";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {

        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setTitle(updatedNote.getTitle());
        note.setCategory(updatedNote.getCategory());
        note.setDifficulty(updatedNote.getDifficulty());
        note.setReadTime(updatedNote.getReadTime());
        note.setContent(updatedNote.getContent());

        return noteRepository.save(note);
    }
}
