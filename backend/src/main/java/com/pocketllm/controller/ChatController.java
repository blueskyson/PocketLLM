
package com.pocketllm.controller;

import com.pocketllm.controller.common.ApiResponse;
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

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Create a new chat
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateChatResponse>> createChat(@RequestBody CreateChatRequest request) {
        Chat chat = chatService.createChat(request.getUserId(), request.getTitle());
        CreateChatResponse response = new CreateChatResponse()
                .setChatId(chat.getChatId())
                .setTitle(chat.getTitle());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Save a message in chat history
     */
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<SaveMessageResponse>> saveMessage(@RequestBody SaveMessageRequest request) {
        ChatHistory message = chatService.saveMessage(request.getChatId(), request.getContent(), request.isFromUser());
        SaveMessageResponse response = new SaveMessageResponse()
                .setId(message.getId())
                .setChatId(message.getChatId())
                .setContent(message.getContent())
                .setFromUser(message.isFromUser())
                .setTimestamp(message.getTimestamp());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all chats for a user
     */
    @GetMapping("/list/{userId}")
    public ResponseEntity<ApiResponse<List<ChatSummaryResponse>>> getChats(@PathVariable Integer userId) {
        List<ChatSummaryResponse> chats = chatService.getChatsForUser(userId).stream()
                .map(chat -> new ChatSummaryResponse()
                        .setChatId(chat.getChatId())
                        .setTitle(chat.getTitle())
                        .setCreatedAt(chat.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(chats));
    }

    /**
     * Get chat history by chatId
     */
    @GetMapping("/history/{chatId}")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChatHistory(@PathVariable String chatId) {
        List<ChatMessageResponse> history = chatService.getChatHistory(chatId).stream()
                .map(msg -> new ChatMessageResponse()
                        .setContent(msg.getContent())
                        .setFromUser(msg.isFromUser())
                        .setTimestamp(msg.getTimestamp()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
