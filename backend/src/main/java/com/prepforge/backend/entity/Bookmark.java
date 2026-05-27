package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bookmarks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long noteId;
}
