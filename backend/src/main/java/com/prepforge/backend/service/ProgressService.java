package com.prepforge.backend.service;

import com.prepforge.backend.dto.response.ProgressDto;
import com.prepforge.backend.entity.*;
import com.prepforge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final QuizSessionRepository          quizSessionRepo;
    private final McqSessionRepository           mcqSessionRepo;
    private final MockSessionRepository          mockSessionRepo;
    private final UserQuestionProgressRepository questionProgressRepo;
    private final UserCodingProgressRepository   codingProgressRepo;
    private final UserStreakRepository           streakRepo;
    private final AptitudeQuestionRepository     aptitudeRepo;
    private final TechnicalMcqRepository         mcqRepo;
    private final InterviewQuestionRepository    iqRepo;

    public ProgressDto getProgress(Long userId) {
        ProgressDto dto = new ProgressDto();

        // ── Module counts ──
        List<QuizSession> aptitudeSessions =
                quizSessionRepo.findByUserIdOrderByAttemptedAtDesc(userId);
        List<McqSession> mcqSessions =
                mcqSessionRepo.findByUserIdOrderByAttemptedAtDesc(userId);
        List<MockSession> mockSessions =
                mockSessionRepo.findByUserIdOrderByCreatedAtDesc(userId);

        long interviewQsAttempted =
                questionProgressRepo.countByUserId(userId);
        long codingSolved =
                codingProgressRepo.countByUserIdAndStatus(userId, "SOLVED");

        dto.setAptitudeAttempted(aptitudeSessions.size());
        dto.setMcqAttempted(mcqSessions.size());
        dto.setMockInterviewsDone(mockSessions.size());
        dto.setInterviewQsAttempted((int) interviewQsAttempted);
        dto.setCodingSolved((int) codingSolved);

        // ── Category stats from Aptitude ──
        List<ProgressDto.CategoryStat> categoryStats = new ArrayList<>();

        Map<String, List<QuizSession>> aptitudeByCategory =
                aptitudeSessions.stream()
                        .collect(Collectors.groupingBy(QuizSession::getCategory));

        aptitudeByCategory.forEach((cat, sessions) -> {
            int attempted = sessions.stream().mapToInt(QuizSession::getTotal).sum();
            int correct   = sessions.stream().mapToInt(QuizSession::getScore).sum();
            double acc    = attempted > 0 ? (double) correct / attempted * 100 : 0;
            categoryStats.add(new ProgressDto.CategoryStat(
                    cat, attempted, correct, acc, "APTITUDE"));
        });

        // ── Category stats from Technical MCQ ──
        Map<String, List<McqSession>> mcqByCategory =
                mcqSessions.stream()
                        .collect(Collectors.groupingBy(McqSession::getCategory));

        mcqByCategory.forEach((cat, sessions) -> {
            int attempted = sessions.stream().mapToInt(McqSession::getTotal).sum();
            int correct   = sessions.stream().mapToInt(McqSession::getScore).sum();
            double acc    = attempted > 0 ? (double) correct / attempted * 100 : 0;
            categoryStats.add(new ProgressDto.CategoryStat(
                    cat, attempted, correct, acc, "MCQ"));
        });

        dto.setCategoryStats(categoryStats);

        // ── Overall stats ──
        int totalAttempted = categoryStats.stream()
                .mapToInt(ProgressDto.CategoryStat::getAttempted).sum();
        int totalCorrect   = categoryStats.stream()
                .mapToInt(ProgressDto.CategoryStat::getCorrect).sum();
        double overallAcc  = totalAttempted > 0
                ? (double) totalCorrect / totalAttempted * 100 : 0;

        dto.setTotalAttempted(totalAttempted);
        dto.setTotalCorrect(totalCorrect);
        dto.setOverallAccuracy(overallAcc);

        // ── Weak areas (accuracy below 50%) ──
        List<ProgressDto.CategoryStat> weakAreas = categoryStats.stream()
                .filter(s -> s.getAccuracy() < 50.0 && s.getAttempted() > 0)
                .sorted(Comparator.comparingDouble(
                        ProgressDto.CategoryStat::getAccuracy))
                .collect(Collectors.toList());

        dto.setWeakAreas(weakAreas);

        // ── Streak ──
        UserStreak streak = streakRepo.findByUserId(userId)
                .orElse(new UserStreak(null, userId, 0, 0, null));
        dto.setCurrentStreak(streak.getCurrentStreak());
        dto.setLongestStreak(streak.getLongestStreak());

        // ── Recommendations — from weakest category ──
        List<ProgressDto.RecommendationItem> recommendations =
                new ArrayList<>();

        if (!weakAreas.isEmpty()) {
            String weakestCategory = weakAreas.get(0).getCategory();
            String weakestModule   = weakAreas.get(0).getModule();

            if ("APTITUDE".equals(weakestModule)) {
                aptitudeRepo.findByCategory(weakestCategory)
                        .stream().limit(5)
                        .forEach(q -> recommendations.add(
                                new ProgressDto.RecommendationItem(
                                        q.getId(), q.getQuestion(),
                                        q.getCategory(), "APTITUDE")));
            } else if ("MCQ".equals(weakestModule)) {
                mcqRepo.findByCategory(weakestCategory)
                        .stream().limit(5)
                        .forEach(q -> recommendations.add(
                                new ProgressDto.RecommendationItem(
                                        q.getId(), q.getQuestion(),
                                        q.getCategory(), "MCQ")));
            }
        }

        dto.setRecommendations(recommendations);

        return dto;
    }

    // ── Update streak when user practices ──
    public UserStreak updateStreak(Long userId) {
        UserStreak streak = streakRepo.findByUserId(userId)
                .orElse(new UserStreak(null, userId, 0, 0, null));

        LocalDate today     = LocalDate.now();
        LocalDate lastActive = streak.getLastActiveDate();

        if (lastActive == null) {
            streak.setCurrentStreak(1);
        } else if (lastActive.equals(today)) {
            // already active today — no change
        } else if (lastActive.equals(today.minusDays(1))) {
            // practiced yesterday — extend streak
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            // missed a day — reset streak
            streak.setCurrentStreak(1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        streak.setLastActiveDate(today);
        streak.setUserId(userId);

        return streakRepo.save(streak);
    }

    // ── Save interview question self assessment ──
    public void saveQuestionProgress(
            Long userId, Long questionId, String status) {
        UserQuestionProgress progress =
                questionProgressRepo
                        .findByUserIdAndQuestionId(userId, questionId)
                        .orElse(new UserQuestionProgress());

        progress.setUserId(userId);
        progress.setQuestionId(questionId);
        progress.setStatus(status);
        questionProgressRepo.save(progress);

        updateStreak(userId);
    }

    // ── Save coding progress ──
    public void saveCodingProgress(
            Long userId, Long questionId, String status) {
        UserCodingProgress progress =
                codingProgressRepo
                        .findByUserIdAndQuestionId(userId, questionId)
                        .orElse(new UserCodingProgress());

        progress.setUserId(userId);
        progress.setQuestionId(questionId);
        progress.setStatus(status);
        codingProgressRepo.save(progress);

        updateStreak(userId);
    }
}
