package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InterviewSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;            // "TCS NQT Prep"
    private String company;          // "TCS"
    private String role;             // "Java Developer"
    private String difficulty;       // Easy, Medium, Hard
    private Integer durationMinutes; // 15, 30, 45

    private LocalDateTime createdAt = LocalDateTime.now();
}
