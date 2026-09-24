package com.mindmentor.backend.dto.session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionStats {
    private int currentStreak;
    private long totalFocusSeconds;
    private long totalSessions;
}
