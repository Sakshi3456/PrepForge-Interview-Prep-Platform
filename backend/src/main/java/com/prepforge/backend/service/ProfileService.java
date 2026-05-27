package com.prepforge.backend.service;

import com.prepforge.backend.dto.request.UpdateProfileRequest;
import com.prepforge.backend.dto.response.ProfileDto;
import com.prepforge.backend.entity.*;
import com.prepforge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository             userRepo;
    private final QuizSessionRepository      quizSessionRepo;
    private final McqSessionRepository       mcqSessionRepo;
    private final MockSessionRepository      mockSessionRepo;
    private final UserCodingProgressRepository codingProgressRepo;
    private final UserStreakRepository       streakRepo;
    private final BookmarkRepository         bookmarkRepo;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    public ProfileDto getProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileDto dto = new ProfileDto();

        // ── Basic info ──
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setTargetRole(user.getTargetRole());
        dto.setCollege(user.getCollege());
        dto.setBio(user.getBio());
        dto.setLinkedinUrl(user.getLinkedinUrl());
        dto.setGithubUrl(user.getGithubUrl());

        // ── Stats ──
        List<QuizSession> aptSessions =
                quizSessionRepo.findByUserIdOrderByAttemptedAtDesc(userId);
        List<McqSession> mcqSessions =
                mcqSessionRepo.findByUserIdOrderByAttemptedAtDesc(userId);
        List<MockSession> mockSessions =
                mockSessionRepo.findByUserIdOrderByCreatedAtDesc(userId);

        int totalAttempted = aptSessions.stream().mapToInt(QuizSession::getTotal).sum()
                + mcqSessions.stream().mapToInt(McqSession::getTotal).sum();
        int totalCorrect   = aptSessions.stream().mapToInt(QuizSession::getScore).sum()
                + mcqSessions.stream().mapToInt(McqSession::getScore).sum();
        double accuracy    = totalAttempted > 0
                ? (double) totalCorrect / totalAttempted * 100 : 0;

        dto.setTotalAttempted(totalAttempted);
        dto.setOverallAccuracy(accuracy);
        dto.setMockInterviewsDone(mockSessions.size());
        dto.setCodingSolved((int) codingProgressRepo
                .countByUserIdAndStatus(userId, "SOLVED"));

        // Streak
        streakRepo.findByUserId(userId).ifPresent(s -> {
            dto.setCurrentStreak(s.getCurrentStreak());
            dto.setLongestStreak(s.getLongestStreak());
        });

        // Bookmark count
        try {
            dto.setBookmarkedNotesCount(
                    bookmarkRepo.findByUserId(userId).size());
        } catch (Exception e) {
            dto.setBookmarkedNotesCount(0);
        }

        // ── Badges ──
        dto.setBadges(computeBadges(
                aptSessions, mcqSessions, mockSessions,
                dto.getCodingSolved(), dto.getCurrentStreak()));

        // ── Recent Activity ──
        List<ProfileDto.ActivityItem> activity = new ArrayList<>();

        aptSessions.stream().limit(3).forEach(s ->
                activity.add(new ProfileDto.ActivityItem(
                        "APTITUDE",
                        "Aptitude — " + s.getCategory(),
                        s.getScore() + "/" + s.getTotal(),
                        s.getAttemptedAt().format(FMT),
                        "🧠")));

        mcqSessions.stream().limit(3).forEach(s ->
                activity.add(new ProfileDto.ActivityItem(
                        "MCQ",
                        "Technical MCQ — " + s.getCategory(),
                        s.getScore() + "/" + s.getTotal(),
                        s.getAttemptedAt().format(FMT),
                        "📝")));

        mockSessions.stream().limit(3).forEach(s ->
                activity.add(new ProfileDto.ActivityItem(
                        "MOCK",
                        "Mock Interview — " + s.getCompany(),
                        s.getScore() + "/" + s.getTotal(),
                        s.getCreatedAt().format(FMT),
                        "🎯")));

        // Sort by date descending, take last 6
        activity.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        dto.setRecentActivity(activity.stream().limit(6).toList());

        return dto;
    }

    public User updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(req.getName());
        user.setTargetRole(req.getTargetRole());
        user.setCollege(req.getCollege());
        user.setBio(req.getBio());
        user.setLinkedinUrl(req.getLinkedinUrl());
        user.setGithubUrl(req.getGithubUrl());

        return userRepo.save(user);
    }

    // ── Badge logic ──
    private List<ProfileDto.Badge> computeBadges(
            List<QuizSession> apt, List<McqSession> mcq,
            List<MockSession> mock, int codingSolved, Integer streak) {

        List<ProfileDto.Badge> badges = new ArrayList<>();

        // First quiz
        if (!apt.isEmpty() || !mcq.isEmpty()) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🎯");
            b.setTitle("First Step");
            b.setDescription("Completed your first quiz");
            b.setColor("bg-indigo-100 text-indigo-600");
            badges.add(b);
        }

        // 5 aptitude sessions
        if (apt.size() >= 5) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🧠");
            b.setTitle("Quiz Enthusiast");
            b.setDescription("Completed 5 aptitude quizzes");
            b.setColor("bg-violet-100 text-violet-600");
            badges.add(b);
        }

        // 10 aptitude sessions
        if (apt.size() >= 10) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🏆");
            b.setTitle("Aptitude Master");
            b.setDescription("Completed 10 aptitude quizzes");
            b.setColor("bg-amber-100 text-amber-600");
            badges.add(b);
        }

        // First mock interview
        if (!mock.isEmpty()) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🎤");
            b.setTitle("Interviewer Ready");
            b.setDescription("Completed your first mock interview");
            b.setColor("bg-blue-100 text-blue-600");
            badges.add(b);
        }

        // 5 mock interviews
        if (mock.size() >= 5) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🌟");
            b.setTitle("Mock Master");
            b.setDescription("Completed 5 mock interviews");
            b.setColor("bg-yellow-100 text-yellow-600");
            badges.add(b);
        }

        // 10 coding solved
        if (codingSolved >= 10) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("💻");
            b.setTitle("Code Warrior");
            b.setDescription("Solved 10 coding problems");
            b.setColor("bg-emerald-100 text-emerald-600");
            badges.add(b);
        }

        // 50 coding solved
        if (codingSolved >= 50) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("⚡");
            b.setTitle("DSA Champion");
            b.setDescription("Solved 50 coding problems");
            b.setColor("bg-orange-100 text-orange-600");
            badges.add(b);
        }

        // 7 day streak
        if (streak != null && streak >= 7) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("🔥");
            b.setTitle("On Fire");
            b.setDescription("7 day practice streak");
            b.setColor("bg-rose-100 text-rose-600");
            badges.add(b);
        }

        // 30 day streak
        if (streak != null && streak >= 30) {
            ProfileDto.Badge b = new ProfileDto.Badge();
            b.setIcon("👑");
            b.setTitle("Consistent");
            b.setDescription("30 day practice streak");
            b.setColor("bg-purple-100 text-purple-600");
            badges.add(b);
        }

        // High MCQ accuracy
        if (!mcq.isEmpty()) {
            double avgAccuracy = mcq.stream()
                    .mapToDouble(s -> (double) s.getScore() / s.getTotal() * 100)
                    .average().orElse(0);
            if (avgAccuracy >= 80) {
                ProfileDto.Badge b = new ProfileDto.Badge();
                b.setIcon("🎓");
                b.setTitle("Technical Expert");
                b.setDescription("80%+ average in Technical MCQ");
                b.setColor("bg-cyan-100 text-cyan-600");
                badges.add(b);
            }
        }

        return badges;
    }
}
