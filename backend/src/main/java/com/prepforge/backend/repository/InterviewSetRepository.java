
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.InterviewSet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSetRepository
        extends JpaRepository<InterviewSet, Long> {
    List<InterviewSet> findByCompany(String company);
    List<InterviewSet> findByDifficulty(String difficulty);
}
