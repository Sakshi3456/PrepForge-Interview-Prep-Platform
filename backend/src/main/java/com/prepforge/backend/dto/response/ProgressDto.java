// dto/response/ProgressDto.java
package com.prepforge.backend.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProgressDto {

    // Overall stats
    private Integer totalAttempted;
    private Integer totalCorrect;
    private Double  overallAccuracy;

    // Per category stats
    private List<CategoryStat> categoryStats;

    // Weak areas (accuracy below 50%)
    private List<CategoryStat> weakAreas;

    // Streak
    private Integer currentStreak;
    private Integer longestStreak;

    // Module breakdown
    private Integer aptitudeAttempted;
    private Integer mcqAttempted;
    private Integer interviewQsAttempted;
    private Integer codingSolved;
    private Integer mockInterviewsDone;

    // Recommendations
    private List<RecommendationItem> recommendations;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CategoryStat {
        private String  category;
        private Integer attempted;
        private Integer correct;
        private Double  accuracy;
        private String  module;   // APTITUDE / MCQ / INTERVIEW / CODING
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RecommendationItem {
        private Long   id;
        private String question;
        private String category;
        private String type;     // APTITUDE / MCQ / INTERVIEW
    }
}
