// dto/response/ProfileDto.java
package com.prepforge.backend.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProfileDto {

    // Basic info
    private Long   id;
    private String name;
    private String email;
    private String role;
    private String targetRole;
    private String college;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;

    // Stats
    private Integer totalAttempted;
    private Double  overallAccuracy;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer codingSolved;
    private Integer mockInterviewsDone;

    // Badges
    private List<Badge> badges;

    // Recent activity
    private List<ActivityItem> recentActivity;

    // Bookmarked notes count
    private Integer bookmarkedNotesCount;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Badge {
        private String icon;
        private String title;
        private String description;
        private String color;  // bg color class
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ActivityItem {
        private String type;   // APTITUDE / MCQ / MOCK / CODING
        private String label;
        private String score;
        private String date;
        private String icon;
    }
}
