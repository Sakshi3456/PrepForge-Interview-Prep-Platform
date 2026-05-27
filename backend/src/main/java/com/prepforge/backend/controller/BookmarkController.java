package com.prepforge.backend.controller;

import com.prepforge.backend.entity.Bookmark;
import com.prepforge.backend.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;

    @GetMapping("/{userId}")
    public List<Bookmark> getBookmarks(@PathVariable Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }

    @PostMapping
    public String toggleBookmark(@RequestBody Bookmark bookmark) {

        List<Bookmark> existing =
                bookmarkRepository.findByUserIdAndNoteId(
                        bookmark.getUserId(),
                        bookmark.getNoteId()
                );

        if (!existing.isEmpty()) {
            bookmarkRepository.deleteAll(existing);
            return "Removed";
        } else {
            bookmarkRepository.save(bookmark);
            return "Added";
        }
    }

    @DeleteMapping("/{userId}/{noteId}")
    public String removeBookmark(
            @PathVariable Long userId,
            @PathVariable Long noteId
    ) {
        bookmarkRepository.deleteByUserIdAndNoteId(userId, noteId);
        return "Bookmark Removed";
    }
}
