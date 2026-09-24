package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.chat.ChatMessageDto;
import com.mindmentor.backend.dto.chat.ChatRequest;
import com.mindmentor.backend.dto.chat.ChatResponse;
import com.mindmentor.backend.entity.ChatConversation;
import com.mindmentor.backend.repository.ChatConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Builds a tutoring prompt from the conversation history sent by the
 * frontend (Chat Bot and 3D AI Tutor both call POST /api/chat), asks Ollama
 * for a reply, and persists the exchange so "Chat History" can list past
 * conversations.
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int MAX_HISTORY_TURNS = 8;

    private final OllamaService ollamaService;
    private final ChatConversationRepository chatConversationRepository;

    public ChatResponse chat(String userId, ChatRequest request) {
        String prompt = buildPrompt(request);
        String reply = ollamaService.generate(prompt);

        ChatConversation conversation = persistExchange(userId, request, reply);

        return ChatResponse.builder()
                .reply(reply)
                .conversationId(conversation.getId())
                .build();
    }

    public List<ChatConversation> listConversations(String userId) {
        return chatConversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    private String buildPrompt(ChatRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are Mind Mentor, a friendly and encouraging AI study tutor. ")
                .append("Answer the student's question clearly and concisely. ")
                .append("Respond in ").append(request.getLanguage() != null ? request.getLanguage() : "English")
                .append(".\n\n");

        List<ChatMessageDto> history = request.getHistory();
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS);
            sb.append("Conversation so far:\n");
            for (ChatMessageDto turn : history.subList(start, history.size())) {
                sb.append(turn.getRole()).append(": ").append(turn.getContent()).append("\n");
            }
            sb.append("\n");
        }

        sb.append("Student: ").append(request.getMessage()).append("\nTutor:");

        return sb.toString();
    }

    private ChatConversation persistExchange(String userId, ChatRequest request, String reply) {
        ChatConversation conversation;

        if (request.getConversationId() != null) {
            conversation = chatConversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                    .orElseGet(() -> newConversation(userId, request.getMessage()));
        } else {
            conversation = newConversation(userId, request.getMessage());
        }

        Instant now = Instant.now();

        conversation.getMessages().add(ChatConversation.ChatMessage.builder()
                .role("user")
                .content(request.getMessage())
                .timestamp(now)
                .build());

        conversation.getMessages().add(ChatConversation.ChatMessage.builder()
                .role("assistant")
                .content(reply)
                .timestamp(Instant.now())
                .build());

        return chatConversationRepository.save(conversation);
    }

    private ChatConversation newConversation(String userId, String firstMessage) {
        String title = firstMessage.length() > 40 ? firstMessage.substring(0, 40) + "..." : firstMessage;

        return ChatConversation.builder()
                .userId(userId)
                .title(title)
                .build();
    }

    public Optional<ChatConversation> getConversation(String userId, String conversationId) {
        return chatConversationRepository.findByIdAndUserId(conversationId, userId);
    }
}
