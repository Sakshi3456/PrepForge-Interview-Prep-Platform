package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coding_progress")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserCodingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long questionId;

    private String status; // SOLVED / NEED_PRACTICE

    private LocalDateTime solvedAt = LocalDateTime.now();
}
