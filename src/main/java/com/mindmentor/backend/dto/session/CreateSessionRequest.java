package com.mindmentor.backend.dto.session;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSessionRequest {

    @NotNull(message = "duration is required")
    private Long duration; // seconds

    @NotNull(message = "startTime is required")
    private String startTime; // ISO-8601

    @NotNull(message = "endTime is required")
    private String endTime; // ISO-8601

    private String mode = "focus";
}
