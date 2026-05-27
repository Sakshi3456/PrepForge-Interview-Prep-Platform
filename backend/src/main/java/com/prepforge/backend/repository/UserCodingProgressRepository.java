// UserCodingProgressRepository.java
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.UserCodingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCodingProgressRepository
        extends JpaRepository<UserCodingProgress, Long> {

    List<UserCodingProgress> findByUserId(Long userId);

    Optional<UserCodingProgress> findByUserIdAndQuestionId(
            Long userId, Long questionId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);
}
