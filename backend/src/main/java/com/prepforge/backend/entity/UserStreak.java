package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_streaks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Integer currentStreak  = 0;
    private Integer longestStreak  = 0;

    private LocalDate lastActiveDate;
}
