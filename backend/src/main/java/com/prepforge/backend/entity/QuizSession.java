package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String category;
    private Integer score;
    private Integer total;
    private Integer timeTaken;
    private Double accuracy;

    // FIX: Use @PrePersist so timestamp is set at actual save time
    // Field initializer = set at object creation time (can be null after JSON deserialization)
    @Column(nullable = false, updatable = false)
    private LocalDateTime attemptedAt;

    @PrePersist
    public void prePersist() {
        if (this.attemptedAt == null) {
            this.attemptedAt = LocalDateTime.now();
        }
    }
}
