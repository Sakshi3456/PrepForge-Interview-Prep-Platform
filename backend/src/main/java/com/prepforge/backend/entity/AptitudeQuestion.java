package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aptitude_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; // Quant, Logical, Verbal

    @Column(columnDefinition = "TEXT")
    private String question;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;
}
