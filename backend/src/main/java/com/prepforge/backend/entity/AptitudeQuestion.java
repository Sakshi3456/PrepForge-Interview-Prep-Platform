package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aptitude_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AptitudeQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;    // Quantitative, Logical, Verbal, Puzzles

    private String difficulty;  // Easy, Medium, Hard

    @Column(columnDefinition = "TEXT")
    private String question;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer; // A, B, C, or D

    @Column(columnDefinition = "TEXT")
    private String explanation;   // Why this answer is correct
}
