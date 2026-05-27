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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final InterviewSetRepository           setRepo;
    private final InterviewSetQuestionRepository   setQRepo;
    private final MockSessionRepository            sessionRepo;
    private final MockAnswerRepository             answerRepo;
    private final InterviewQuestionRepository      iqRepo;
    private final TechnicalMcqRepository           mcqRepo;
    private final AptitudeQuestionRepository       aptRepo;
    private final CodingQuestionRepository         codingRepo;

    // ── Get all sets ──
    public List<InterviewSet> getAllSets() {
        return setRepo.findAll();
    }

    // ── Get one set ──
    public InterviewSet getSet(Long id) {
        return setRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Set not found"));
    }

    // ── Get questions for a set — pulls from source tables ──
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
                                // correctAnswer NOT set in dto
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

        for (AnswerDto dto : request.getAnswers()) {
            MockAnswer answer = new MockAnswer();
            answer.setSourceQuestionId(dto.getSourceQuestionId());
            answer.setSourceTable(dto.getSourceTable());
            answer.setQuestionType(dto.getQuestionType());
            answer.setQuestionText(dto.getQuestionText());
            answer.setUserAnswer(dto.getUserAnswer());

            boolean isAnswered = dto.getUserAnswer() != null
                    && !dto.getUserAnswer().trim().isEmpty();
            answer.setIsAnswered(isAnswered);

            if ("MCQ".equals(dto.getQuestionType())) {
                mcqTotal++;
                // get correct answer directly from source table
                String correctAnswer = getCorrectAnswer(
                        dto.getSourceTable(),
                        dto.getSourceQuestionId());
                boolean isCorrect = isAnswered
                        && dto.getUserAnswer().equals(correctAnswer);
                answer.setIsCorrect(isCorrect);
                if (isCorrect) { score++; mcqScore++; }

            } else {
                // THEORY or CODING — cannot auto score
                answer.setIsCorrect(null);
                if (isAnswered) score++; // count as attempted
            }

            toSave.add(answer);
        }

        // Save session
        MockSession session = new MockSession();
        session.setUserId(request.getUserId());
        session.setSetId(request.getSetId());
        session.setSetTitle(set.getTitle());
        session.setCompany(set.getCompany());
        session.setScore(score);
        session.setTotal(request.getAnswers().size());
        session.setMcqScore(mcqScore);
        session.setMcqTotal(mcqTotal);
        session.setTimeTaken(request.getTimeTaken());
        MockSession saved = sessionRepo.save(session);

        // Set sessionId on each answer and save all
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
        return sessionRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Get one result ──
    public MockResultDto getResult(Long sessionId) {
        MockSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Not found"));
        List<MockAnswer> answers = answerRepo.findBySessionId(sessionId);
        return new MockResultDto(session, answers);
    }
}
