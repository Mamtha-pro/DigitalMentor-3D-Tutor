package com.mindmentor.learning.util;

import com.mindmentor.learning.entity.StudySession;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.TreeSet;

public final class StreakCalculator {

    private StreakCalculator() {
    }

    public static int currentStreak(List<StudySession> sessions) {

        if (sessions == null || sessions.isEmpty()) {
            return 0;
        }

        TreeSet<LocalDate> studyDays = new TreeSet<>();

        for (StudySession session : sessions) {

            if (session.getStartTime() != null
                    && "focus".equalsIgnoreCase(session.getMode())) {

                studyDays.add(
                        LocalDate.ofInstant(
                                session.getStartTime(),
                                ZoneOffset.UTC
                        )
                );
            }
        }

        if (studyDays.isEmpty()) {
            return 0;
        }

        LocalDate today =
                LocalDate.ofInstant(Instant.now(), ZoneOffset.UTC);

        LocalDate cursor = studyDays.last();

        if (cursor.isBefore(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        LocalDate expected = cursor;

        while (studyDays.contains(expected)) {
            streak++;
            expected = expected.minusDays(1);
        }

        return streak;
    }
}