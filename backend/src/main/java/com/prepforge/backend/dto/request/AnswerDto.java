package com.prepforge.backend.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnswerDto {
    private Long   sourceQuestionId;
    private String sourceTable;
    private String questionText;
    private String questionType;   // THEORY / MCQ / CODING
    private String userAnswer;
    private String correctAnswer;  // MCQ only
    private String answerMode;     // TEXT (default) / SPEECH / CODE
    private String language;       // for CODING mode
}
