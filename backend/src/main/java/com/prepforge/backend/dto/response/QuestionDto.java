package com.prepforge.backend.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionDto {
    private Long refId;
    private Long sourceId;
    private String sourceTable;
    private String questionType;   // THEORY / MCQ / CODING
    private String questionText;
    private String codeSnippet;    // for output-based MCQ
    private String inputOutput;    // for coding questions
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    // correctAnswer NOT included — never sent to frontend
    private Integer orderIndex;
}
