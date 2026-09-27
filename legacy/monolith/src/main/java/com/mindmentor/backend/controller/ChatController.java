package com.mindmentor.backend.controller;

import com.mindmentor.backend.dto.chat.ChatRequest;
import com.mindmentor.backend.dto.chat.ChatResponse;
import com.mindmentor.backend.entity.ChatConversation;
import com.mindmentor.backend.service.ChatService;
import com.mindmentor.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AI Chat / Tutor")
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/api/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.chat(SecurityUtil.currentUserId(), request));
    }

    @GetMapping("/api/chat/history")
    public ResponseEntity<List<ChatConversation>> history() {
        return ResponseEntity.ok(chatService.listConversations(SecurityUtil.currentUserId()));
    }
}
