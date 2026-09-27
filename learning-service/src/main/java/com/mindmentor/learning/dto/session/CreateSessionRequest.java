package com.mindmentor.learning.dto.session;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSessionRequest {

    @NotNull(message = "duration is required")
    private Long duration;

    @NotNull(message = "startTime is required")
    private String startTime;

    @NotNull(message = "endTime is required")
    private String endTime;

    private String mode = "focus";
}