package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CodingQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String topic;        // Arrays, Strings, Trees, DP etc

    private String difficulty;   // Basic, Intermediate, Hard

    private String language;     // Java, Python, JavaScript

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String inputOutput;   // Expected input/output examples

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(columnDefinition = "TEXT")
    private String approach;      // Step by step thinking

    @Column(columnDefinition = "TEXT")
    private String solution;      // Actual code solution

    private String timeComplexity;   // O(n), O(log n) etc

    private String spaceComplexity;  // O(1), O(n) etc

    private String companyTags;  // "TCS, Amazon, Wipro" comma separated

    private Boolean isSolved = false; // temporary — user-based later
}
