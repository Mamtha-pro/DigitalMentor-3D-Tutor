package com.mindmentor.backend.dto.resource;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WebSearchRequest {

    @NotBlank(message = "Query is required")
    private String query;
}
