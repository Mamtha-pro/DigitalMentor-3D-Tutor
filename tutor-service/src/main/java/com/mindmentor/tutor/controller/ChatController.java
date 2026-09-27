package com.mindmentor.tutor.controller;

import com.mindmentor.tutor.dto.chat.ChatRequest;
import com.mindmentor.tutor.dto.chat.ChatResponse;
import com.mindmentor.tutor.entity.ChatConversation;
import com.mindmentor.tutor.service.ChatService;
import com.mindmentor.tutor.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/api/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {

        return ResponseEntity.ok(
                chatService.chat(
                        SecurityUtil.currentUserId(),
                        request
                )
        );
    }

    @GetMapping("/api/chat/history")
    public ResponseEntity<List<ChatConversation>> history() {

        return ResponseEntity.ok(
                chatService.listConversations(
                        SecurityUtil.currentUserId()
                )
        );
    }
}