package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MockSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long setId;
    private String setTitle;
    private String company;

    private Integer score;       // MCQ correct + theory/coding answered
    private Integer total;       // total questions
    private Integer mcqScore;    // only MCQ correct count
    private Integer mcqTotal;    // only MCQ count
    private Integer timeTaken;   // seconds

    private LocalDateTime createdAt = LocalDateTime.now();
}
