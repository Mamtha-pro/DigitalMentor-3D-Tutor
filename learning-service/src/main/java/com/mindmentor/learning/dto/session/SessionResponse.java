package com.mindmentor.learning.dto.session;

import com.mindmentor.learning.entity.StudySession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {

    private StudySession session;
    private SessionStats stats;
}