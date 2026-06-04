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
    private String questionType;   // THEORY / MCQ / CODING

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    private Boolean isAnswered;
    private Boolean isCorrect;     // null=not evaluated, true/false for MCQ

    // ── AI feedback ──
    private Integer aiScore;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    // ── Future: answer mode ──
    private String answerMode;     // TEXT / SPEECH / CODE

    // ── Future: code execution ──
    private String language;

    @Column(columnDefinition = "TEXT")
    private String actualOutput;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    private Boolean codeCorrect;
}
