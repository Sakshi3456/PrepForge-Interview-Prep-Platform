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

    private String category;    // which category was attempted

    private Integer score;      // how many correct

    private Integer total;      // total questions attempted

    private Integer timeTaken;  // in seconds

    private Double accuracy;    // score/total * 100

    private LocalDateTime attemptedAt = LocalDateTime.now();
}
