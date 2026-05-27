package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mcq_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class McqSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String category;

    private Integer score;

    private Integer total;

    private Integer timeTaken;    // seconds

    private Double accuracy;

    private LocalDateTime attemptedAt = LocalDateTime.now();
}
