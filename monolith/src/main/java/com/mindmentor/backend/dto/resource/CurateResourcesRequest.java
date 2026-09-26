package com.mindmentor.backend.dto.resource;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CurateResourcesRequest {
    private String userId;

    @NotBlank(message = "Subject is required")
    private String subject;
}
