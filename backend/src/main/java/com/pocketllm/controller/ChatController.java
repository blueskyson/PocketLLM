
package com.pocketllm.controller;

import com.pocketllm.SessionStore;
import com.pocketllm.model.request.CreateChatRequest;
import com.pocketllm.model.request.SaveMessageRequest;
import com.pocketllm.model.response.CreateChatResponse;
import com.pocketllm.model.response.SaveMessageResponse;
import com.pocketllm.model.response.ChatSummaryResponse;
import com.pocketllm.model.response.ChatMessageResponse;
import com.pocketllm.model.entity.Chat;
import com.pocketllm.model.entity.ChatHistory;
import com.pocketllm.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SessionStore sessionStore;

    public ChatController(ChatService chatService, SessionStore sessionStore) {
        this.chatService = chatService;
        this.sessionStore = sessionStore;
    }

    /**
     * Create a new chat
     */
    @PostMapping("/create")
    public ResponseEntity<CreateChatResponse> createChat(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestBody CreateChatRequest request) {

        String userId = sessionStore.getUserId(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Chat chat = chatService.createChat(userId, request.getTitle());
        CreateChatResponse response = new CreateChatResponse()
                .setChatId(chat.getChatId())
                .setTitle(chat.getTitle());
        return ResponseEntity.ok(response);
    }

    /**
     * Save a message in chat history (ownership checked)
     */
    @PostMapping("/message")
    public ResponseEntity<SaveMessageResponse> saveMessage(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestBody SaveMessageRequest request) {

        String userId = sessionStore.getUserId(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            ChatHistory message = chatService.saveMessageForUser(userId, request.getChatId(), request.getContent(), request.isFromUser());
            SaveMessageResponse response = new SaveMessageResponse()
                    .setId(message.getId())
                    .setChatId(message.getChatId())
                    .setContent(message.getContent())
                    .setFromUser(message.isFromUser())
                    .setTimestamp(message.getTimestamp());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).build();
        }
    }

    /**
     * Get all chats for the current session user
     */
    @GetMapping("/list")
    public ResponseEntity<List<ChatSummaryResponse>> getChats(
            @RequestHeader("X-Session-Id") String sessionId) {

        String userId = sessionStore.getUserId(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        List<ChatSummaryResponse> chats = chatService.getChatsForUser(userId).stream()
                .map(chat -> new ChatSummaryResponse()
                        .setChatId(chat.getChatId())
                        .setTitle(chat.getTitle())
                        .setCreatedAt(chat.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(chats);
    }

    /**
     * Get chat history by chatId (ownership checked)
     */
    @GetMapping("/history/{chatId}")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable String chatId) {

        String userId = sessionStore.getUserId(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            List<ChatMessageResponse> history = chatService.getChatHistoryForUser(userId, chatId).stream()
                    .map(msg -> new ChatMessageResponse()
                            .setContent(msg.getContent())
                            .setFromUser(msg.isFromUser())
                            .setTimestamp(msg.getTimestamp()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).build();
        }
    }

    /**
     * Delete a single chat by chatId (ownership checked)
     */
    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable String chatId) {

        String userId = sessionStore.getUserId(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            chatService.deleteChat(userId, chatId);
            return ResponseEntity.noContent().build(); // 204
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build(); // 404
        }
    }
}
