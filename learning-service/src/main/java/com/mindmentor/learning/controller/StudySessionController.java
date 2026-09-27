package com.mindmentor.learning.controller;

import com.mindmentor.learning.dto.session.CreateSessionRequest;
import com.mindmentor.learning.dto.session.SessionResponse;
import com.mindmentor.learning.dto.session.SessionStats;
import com.mindmentor.learning.entity.StudySession;
import com.mindmentor.learning.service.StudySessionService;
import com.mindmentor.learning.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> recordSession(
            @Valid @RequestBody CreateSessionRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        studySessionService.recordSession(
                                SecurityUtil.currentUserId(),
                                request
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<StudySession>> listSessions() {

        return ResponseEntity.ok(
                studySessionService.listSessions(
                        SecurityUtil.currentUserId()
                )
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<SessionStats> getStats() {

        return ResponseEntity.ok(
                studySessionService.getStats(
                        SecurityUtil.currentUserId()
                )
        );
    }
}