package com.prepforge.backend.dto.response;

import com.prepforge.backend.entity.MockAnswer;
import com.prepforge.backend.entity.MockSession;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MockResultDto {
    private MockSession session;
    private List<MockAnswer> answers;
}
