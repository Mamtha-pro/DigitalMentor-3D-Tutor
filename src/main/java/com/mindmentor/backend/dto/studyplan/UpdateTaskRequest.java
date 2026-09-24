package com.mindmentor.backend.dto.studyplan;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskRequest {

    @NotNull(message = "weekIndex is required")
    private Integer weekIndex;

    @NotNull(message = "dayIndex is required")
    private Integer dayIndex;

    @NotNull(message = "taskIndex is required")
    private Integer taskIndex;

    @NotNull(message = "completed is required")
    private Boolean completed;
}
