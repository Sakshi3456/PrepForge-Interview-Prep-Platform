package com.prepforge.backend.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubmitRequest {
    private Long userId;
    private Long setId;
    private Integer timeTaken;
    private List<AnswerDto> answers;
}
