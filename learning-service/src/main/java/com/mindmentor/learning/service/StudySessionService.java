package com.mindmentor.learning.service;

import com.mindmentor.learning.dto.session.CreateSessionRequest;
import com.mindmentor.learning.dto.session.SessionResponse;
import com.mindmentor.learning.dto.session.SessionStats;
import com.mindmentor.learning.entity.StudySession;
import com.mindmentor.learning.repository.StudySessionRepository;
import com.mindmentor.learning.util.StreakCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;

    public SessionResponse recordSession(
            String userId,
            CreateSessionRequest request) {

        StudySession session = StudySession.builder()
                .userId(userId)
                .duration(request.getDuration())
                .startTime(
                        java.time.Instant.parse(
                                request.getStartTime()
                        )
                )
                .endTime(
                        java.time.Instant.parse(
                                request.getEndTime()
                        )
                )
                .mode(
                        request.getMode() != null
                                ? request.getMode()
                                : "focus"
                )
                .build();

        StudySession saved =
                studySessionRepository.save(session);

        List<StudySession> allSessions =
                studySessionRepository
                        .findByUserIdOrderByStartTimeDesc(userId);

        SessionStats stats = SessionStats.builder()
                .currentStreak(
                        StreakCalculator.currentStreak(
                                allSessions
                        )
                )
                .totalFocusSeconds(
                        allSessions.stream()
                                .filter(s ->
                                        "focus".equalsIgnoreCase(
                                                s.getMode()
                                        )
                                )
                                .mapToLong(
                                        StudySession::getDuration
                                )
                                .sum()
                )
                .totalSessions(allSessions.size())
                .build();

        return SessionResponse.builder()
                .session(saved)
                .stats(stats)
                .build();
    }

    public List<StudySession> listSessions(
            String userId) {

        return studySessionRepository
                .findByUserIdOrderByStartTimeDesc(userId);
    }

    public SessionStats getStats(String userId) {

        List<StudySession> allSessions =
                studySessionRepository
                        .findByUserIdOrderByStartTimeDesc(userId);

        return SessionStats.builder()
                .currentStreak(
                        StreakCalculator.currentStreak(
                                allSessions
                        )
                )
                .totalFocusSeconds(
                        allSessions.stream()
                                .filter(s ->
                                        "focus".equalsIgnoreCase(
                                                s.getMode()
                                        )
                                )
                                .mapToLong(
                                        StudySession::getDuration
                                )
                                .sum()
                )
                .totalSessions(allSessions.size())
                .build();
    }
}