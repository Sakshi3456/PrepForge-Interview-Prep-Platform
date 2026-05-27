// UserQuestionProgressRepository.java
package com.prepforge.backend.repository;

import com.prepforge.backend.entity.UserQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserQuestionProgressRepository
        extends JpaRepository<UserQuestionProgress, Long> {

    List<UserQuestionProgress> findByUserId(Long userId);

    Optional<UserQuestionProgress> findByUserIdAndQuestionId(
            Long userId, Long questionId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);
}
