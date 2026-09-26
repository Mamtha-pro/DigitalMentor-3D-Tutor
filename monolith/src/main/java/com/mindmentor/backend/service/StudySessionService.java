package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.session.CreateSessionRequest;
import com.mindmentor.backend.dto.session.SessionResponse;
import com.mindmentor.backend.dto.session.SessionStats;
import com.mindmentor.backend.entity.StudySession;
import com.mindmentor.backend.repository.StudySessionRepository;
import com.mindmentor.backend.util.StreakCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;

    public SessionResponse recordSession(String userId, CreateSessionRequest request) {
        StudySession session = StudySession.builder()
                .userId(userId)
                .duration(request.getDuration())
                .startTime(Instant.parse(request.getStartTime()))
                .endTime(Instant.parse(request.getEndTime()))
                .mode(request.getMode() != null ? request.getMode() : "focus")
                .build();

        StudySession saved = studySessionRepository.save(session);

        List<StudySession> allSessions = studySessionRepository.findByUserIdOrderByStartTimeDesc(userId);

        SessionStats stats = SessionStats.builder()
                .currentStreak(StreakCalculator.currentStreak(allSessions))
                .totalFocusSeconds(allSessions.stream()
                        .filter(s -> "focus".equalsIgnoreCase(s.getMode()))
                        .mapToLong(StudySession::getDuration)
                        .sum())
                .totalSessions(allSessions.size())
                .build();

        return SessionResponse.builder().session(saved).stats(stats).build();
    }

    public List<StudySession> listSessions(String userId) {
        return studySessionRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public SessionStats getStats(String userId) {
        List<StudySession> allSessions = studySessionRepository.findByUserIdOrderByStartTimeDesc(userId);

        return SessionStats.builder()
                .currentStreak(StreakCalculator.currentStreak(allSessions))
                .totalFocusSeconds(allSessions.stream()
                        .filter(s -> "focus".equalsIgnoreCase(s.getMode()))
                        .mapToLong(StudySession::getDuration)
                        .sum())
                .totalSessions(allSessions.size())
                .build();
    }
}
