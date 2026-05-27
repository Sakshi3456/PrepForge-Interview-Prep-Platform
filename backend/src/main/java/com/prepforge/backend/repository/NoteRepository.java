package com.prepforge.backend.repository;

import com.prepforge.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title,
            String content
    );
}
