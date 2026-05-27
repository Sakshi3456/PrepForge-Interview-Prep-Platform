package com.prepforge.backend.repository;

import com.prepforge.backend.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserId(Long userId);

    List<Bookmark> findByUserIdAndNoteId(Long userId, Long noteId);

    void deleteByUserIdAndNoteId(Long userId, Long noteId);
}
