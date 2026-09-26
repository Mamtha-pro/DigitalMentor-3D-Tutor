package com.mindmentor.backend.dto.studyplan;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStudyPlanRequest {

    private String userId; // optional; the authenticated user id is used when present

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Exam date is required")
    private String examDate; // ISO date string, e.g. 2026-12-01
}
