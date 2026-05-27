package com.prepforge.backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    private String difficulty;
    private String companyTag;
    private Boolean isFavorite = false;
    private Boolean frequentlyAsked = false; // ADD THIS
}