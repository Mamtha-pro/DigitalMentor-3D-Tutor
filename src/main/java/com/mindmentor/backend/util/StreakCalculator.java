package com.mindmentor.backend.util;

import com.mindmentor.backend.entity.StudySession;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.TreeSet;

/**
 * Derives a "current streak" (consecutive days with at least one focus
 * session) from a user's study session history, mirroring what the Timer
 * widget on the frontend surfaces to the user after each completed session.
 */
public final class StreakCalculator {

    private StreakCalculator() {
    }

    public static int currentStreak(List<StudySession> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            return 0;
        }

        TreeSet<LocalDate> studyDays = new TreeSet<>();
        for (StudySession session : sessions) {
            if (session.getStartTime() != null && "focus".equalsIgnoreCase(session.getMode())) {
                studyDays.add(LocalDate.ofInstant(session.getStartTime(), ZoneOffset.UTC));
            }
        }

        if (studyDays.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.ofInstant(Instant.now(), ZoneOffset.UTC);
        LocalDate cursor = studyDays.last();

        // The streak only counts if the most recent study day was today or yesterday.
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
