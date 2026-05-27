package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_set_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InterviewSetQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long setId;

    // Which table question comes from
    private String sourceTable;
    // INTERVIEW_QUESTION / TECHNICAL_MCQ / APTITUDE / CODING

    private Long sourceQuestionId; // id in that table

    private Integer orderIndex;
}
