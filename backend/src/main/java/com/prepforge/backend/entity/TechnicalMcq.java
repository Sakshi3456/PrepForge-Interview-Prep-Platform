package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "technical_mcq")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TechnicalMcq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;      // Java, React, Python, Spring Boot, DBMS, OS, Networking

    private String difficulty;    // Easy, Medium, Hard

    private String questionType;  // THEORY, OUTPUT_BASED

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;   // for output-based questions

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer; // optionA, optionB, optionC, optionD

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private Boolean frequentlyAsked = false;
}
