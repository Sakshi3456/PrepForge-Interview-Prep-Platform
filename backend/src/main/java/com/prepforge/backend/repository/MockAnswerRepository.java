
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.MockAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockAnswerRepository
        extends JpaRepository<MockAnswer, Long> {
    List<MockAnswer> findBySessionId(Long sessionId);
}
