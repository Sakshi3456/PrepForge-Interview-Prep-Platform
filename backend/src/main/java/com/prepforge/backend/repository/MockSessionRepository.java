
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.MockSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockSessionRepository
        extends JpaRepository<MockSession, Long> {
    List<MockSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
