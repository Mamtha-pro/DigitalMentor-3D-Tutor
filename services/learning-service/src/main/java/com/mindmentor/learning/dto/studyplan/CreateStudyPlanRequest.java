package com.mindmentor.learning.dto.studyplan;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStudyPlanRequest {

    private String userId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Exam date is required")
    private String examDate;
}