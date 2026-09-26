package com.mindmentor.backend.controller;

import com.mindmentor.backend.dto.session.CreateSessionRequest;
import com.mindmentor.backend.dto.session.SessionResponse;
import com.mindmentor.backend.dto.session.SessionStats;
import com.mindmentor.backend.entity.StudySession;
import com.mindmentor.backend.service.StudySessionService;
import com.mindmentor.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Study Sessions")
@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> recordSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studySessionService.recordSession(SecurityUtil.currentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<StudySession>> listSessions() {
        return ResponseEntity.ok(studySessionService.listSessions(SecurityUtil.currentUserId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<SessionStats> getStats() {
        return ResponseEntity.ok(studySessionService.getStats(SecurityUtil.currentUserId()));
    }
}
