package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_question_progress")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long questionId;

    private String status; // KNEW / DIDNT_KNOW

    private LocalDateTime attemptedAt = LocalDateTime.now();
}
