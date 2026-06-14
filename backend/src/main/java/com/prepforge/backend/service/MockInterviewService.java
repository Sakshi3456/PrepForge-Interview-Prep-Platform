package com.prepforge.backend.service;

import com.prepforge.backend.dto.request.AnswerDto;
import com.prepforge.backend.dto.request.SubmitRequest;
import com.prepforge.backend.dto.response.MockResultDto;
import com.prepforge.backend.dto.response.QuestionDto;
import com.prepforge.backend.entity.*;
import com.prepforge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final InterviewSetRepository         setRepo;
    private final InterviewSetQuestionRepository setQRepo;
    private final MockSessionRepository          sessionRepo;
    private final MockAnswerRepository           answerRepo;
    private final InterviewQuestionRepository    iqRepo;
    private final TechnicalMcqRepository         mcqRepo;
    private final AptitudeQuestionRepository     aptRepo;
    private final CodingQuestionRepository       codingRepo;
    private final GroqService groqService;

    // ── Get all sets ──
    public List<InterviewSet> getAllSets() {
        return setRepo.findAll();
    }

    // ── Get one set ──
    public InterviewSet getSet(Long id) {
        return setRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Set not found"));
    }

    // ── Get questions for a set ──
    public List<QuestionDto> getQuestionsForSet(Long setId) {
        List<InterviewSetQuestion> refs =
                setQRepo.findBySetIdOrderByOrderIndex(setId);

        List<QuestionDto> result = new ArrayList<>();

        for (InterviewSetQuestion ref : refs) {
            QuestionDto dto = new QuestionDto();
            dto.setRefId(ref.getId());
            dto.setSourceId(ref.getSourceQuestionId());
            dto.setSourceTable(ref.getSourceTable());
            dto.setOrderIndex(ref.getOrderIndex());

            switch (ref.getSourceTable()) {

                case "INTERVIEW_QUESTION" -> {
                    iqRepo.findById(ref.getSourceQuestionId())
                            .ifPresent(q -> {
                                dto.setQuestionText(q.getQuestion());
                                dto.setQuestionType("THEORY");
                            });
                }

                case "TECHNICAL_MCQ" -> {
                    mcqRepo.findById(ref.getSourceQuestionId())
                            .ifPresent(q -> {
                                dto.setQuestionText(q.getQuestion());
                                dto.setQuestionType("MCQ");
                                dto.setCodeSnippet(q.getCodeSnippet());
                                dto.setOptionA(q.getOptionA());
                                dto.setOptionB(q.getOptionB());
                                dto.setOptionC(q.getOptionC());
                                dto.setOptionD(q.getOptionD());
                            });
                }

                case "APTITUDE" -> {
                    aptRepo.findById(ref.getSourceQuestionId())
                            .ifPresent(q -> {
                                dto.setQuestionText(q.getQuestion());
                                dto.setQuestionType("MCQ");
                                dto.setOptionA(q.getOptionA());
                                dto.setOptionB(q.getOptionB());
                                dto.setOptionC(q.getOptionC());
                                dto.setOptionD(q.getOptionD());
                            });
                }

                case "CODING" -> {
                    codingRepo.findById(ref.getSourceQuestionId())
                            .ifPresent(q -> {
                                dto.setQuestionText(q.getProblemStatement());
                                dto.setQuestionType("CODING");
                                dto.setInputOutput(q.getInputOutput());
                            });
                }
            }

            if (dto.getQuestionText() != null) {
                result.add(dto);
            }
        }
        return result;
    }

    // ── Admin: create set ──
    public InterviewSet createSet(InterviewSet set) {
        return setRepo.save(set);
    }

    // ── Admin: update set ──
    public InterviewSet updateSet(Long id, InterviewSet updated) {
        InterviewSet set = setRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        set.setTitle(updated.getTitle());
        set.setCompany(updated.getCompany());
        set.setRole(updated.getRole());
        set.setDifficulty(updated.getDifficulty());
        set.setDurationMinutes(updated.getDurationMinutes());
        return setRepo.save(set);
    }

    // ── Admin: delete set ──
    @Transactional
    public void deleteSet(Long id) {
        setQRepo.deleteBySetId(id);
        setRepo.deleteById(id);
    }

    // ── Admin: add question to set ──
    public InterviewSetQuestion addQuestionToSet(
            Long setId, InterviewSetQuestion q) {
        q.setSetId(setId);
        List<InterviewSetQuestion> existing =
                setQRepo.findBySetIdOrderByOrderIndex(setId);
        q.setOrderIndex(existing.size() + 1);
        return setQRepo.save(q);
    }

    // ── Admin: remove question from set ──
    public void removeQuestionFromSet(Long refId) {
        setQRepo.deleteById(refId);
    }

    // ── Submit interview ──
    @Transactional
    public MockSession submitInterview(SubmitRequest request) {
        InterviewSet set = setRepo.findById(request.getSetId())
                .orElseThrow(() -> new RuntimeException("Set not found"));

        int score    = 0;
        int mcqScore = 0;
        int mcqTotal = 0;

        List<MockAnswer> toSave = new ArrayList<>();

        // ── Step 1: Process all answers ──
        for (AnswerDto dto : request.getAnswers()) {
            MockAnswer answer = new MockAnswer();
            answer.setSourceQuestionId(dto.getSourceQuestionId());
            answer.setSourceTable(dto.getSourceTable());
            answer.setQuestionType(dto.getQuestionType());
            answer.setQuestionText(dto.getQuestionText());
            answer.setUserAnswer(dto.getUserAnswer());
            answer.setAnswerMode(
                    dto.getAnswerMode() != null
                            ? dto.getAnswerMode() : "TEXT");
            answer.setLanguage(dto.getLanguage());

            boolean isAnswered = dto.getUserAnswer() != null
                    && !dto.getUserAnswer().trim().isEmpty();
            answer.setIsAnswered(isAnswered);

            if ("MCQ".equals(dto.getQuestionType())) {
                // Auto score MCQ
                mcqTotal++;
                String correct = getCorrectAnswer(
                        dto.getSourceTable(),
                        dto.getSourceQuestionId());
                boolean isCorrect = isAnswered
                        && dto.getUserAnswer().equals(correct);
                answer.setIsCorrect(isCorrect);
                if (isCorrect) { score++; mcqScore++; }

            } else {
                // THEORY or CODING — will be AI scored
                answer.setIsCorrect(null);
                if (isAnswered) score++;
            }

            toSave.add(answer);
        }

        // ── Step 2: Parallel Gemini calls for THEORY + CODING ──
        List<MockAnswer> needsAi = toSave.stream()
                .filter(a ->
                        ("THEORY".equals(a.getQuestionType())
                                || "CODING".equals(a.getQuestionType()))
                                && Boolean.TRUE.equals(a.getIsAnswered()))
                .toList();

        if (!needsAi.isEmpty()) {
            try {

                // Fire all Gemini calls simultaneously
                List<GroqService.GroqResult> results =
                        Flux.fromIterable(needsAi)
                                .flatMap(a ->
                                        Mono.fromCallable(() ->
                                                groqService.getFeedbackWithRetry(
                                                        a.getQuestionText(),
                                                        a.getUserAnswer()
                                                )
                                        ).subscribeOn(Schedulers.boundedElastic())
                                )
                                .collectList()
                                .block();

                // Apply results back to answers
                for (int i = 0; i < needsAi.size(); i++) {

                    GroqService.GroqResult ai =
                            results.get(i);

                    MockAnswer answer =
                            needsAi.get(i);

                    answer.setAiScore(ai.score);

                    String feedback = ai.feedback;

                    if (ai.idealPoints != null
                            && !ai.idealPoints.isEmpty()) {

                        feedback += "\n\n💡 Key points: "
                                + ai.idealPoints;
                    }

                    answer.setAiFeedback(feedback);
                }

            } catch (Exception e) {

                e.printStackTrace();
            }
        }

        // ── Step 3: Save session ──
        MockSession session = new MockSession();
        session.setUserId(request.getUserId());
        session.setSetId(request.getSetId());
        session.setSetTitle(set.getTitle());
        session.setCompany(set.getCompany());
        session.setScore(score);
        int total = request.getAnswers() != null ? request.getAnswers().size() : 0;
        session.setTotal(total);
        session.setMcqScore(mcqScore);
        session.setMcqTotal(mcqTotal);
        session.setTimeTaken(request.getTimeTaken());
        MockSession saved = sessionRepo.save(session);

        // ── Step 4: Save answers ──
        toSave.forEach(a -> a.setSessionId(saved.getId()));
        answerRepo.saveAll(toSave);

        return saved;
    }

    // ── Get correct answer from source table ──
    private String getCorrectAnswer(String sourceTable, Long id) {
        return switch (sourceTable) {
            case "TECHNICAL_MCQ" -> mcqRepo.findById(id)
                    .map(TechnicalMcq::getCorrectAnswer).orElse("");
            case "APTITUDE"      -> aptRepo.findById(id)
                    .map(AptitudeQuestion::getCorrectAnswer).orElse("");
            default -> "";
        };
    }

    // ── Get user history ──
    public List<MockSession> getHistory(Long userId) {
        return sessionRepo
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Get one result ──
    public MockResultDto getResult(Long sessionId) {
        MockSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException("Not found"));
        List<MockAnswer> answers =
                answerRepo.findBySessionId(sessionId);
        return new MockResultDto(session, answers);
    }
}
