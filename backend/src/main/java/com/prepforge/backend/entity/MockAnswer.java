package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mock_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MockAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;
    private Long sourceQuestionId;
    private String sourceTable;
    private String questionType;  // THEORY / MCQ / CODING

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    private Boolean isAnswered;
    private Boolean isCorrect;   // null for THEORY/CODING, true/false for MCQ

    // AI fields — null now, filled in Step 4
    private Integer aiScore;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;
}
