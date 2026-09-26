package com.mindmentor.backend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ChatRequest {

    @NotBlank(message = "message is required")
    private String message;

    private String language = "English";

    private List<ChatMessageDto> history = new ArrayList<>();

    private String conversationId; // optional: continues an existing stored conversation
}
