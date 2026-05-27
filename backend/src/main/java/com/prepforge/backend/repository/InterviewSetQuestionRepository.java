
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.InterviewSetQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSetQuestionRepository
        extends JpaRepository<InterviewSetQuestion, Long> {
    List<InterviewSetQuestion> findBySetIdOrderByOrderIndex(Long setId);
    void deleteBySetId(Long setId);
}
