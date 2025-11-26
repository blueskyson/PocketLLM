
package com.pocketllm.service;

import com.pocketllm.model.entity.Chat;
import com.pocketllm.model.entity.ChatHistory;
import com.pocketllm.repository.ChatRepository;
import com.pocketllm.repository.ChatHistoryRepository;
import com.pocketllm.llm.LlmClient; // Import the LLM client
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final LlmClient llmClient; // Inject LLMClient

    public ChatService(ChatRepository chatRepository,
                       ChatHistoryRepository chatHistoryRepository,
                       LlmClient llmClient) {
        this.chatRepository = chatRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.llmClient = llmClient;
    }

    /**
     * Create a new chat for a user
     */
    public Chat createChat(String userId, String title) {
        Chat chat = Chat.builder()
                .userId(userId)
                .title(title)
                .chatId(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .build();
        return chatRepository.save(chat);
    }

    /**
     * Get all chats for a user
     */
    public List<Chat> getChatsForUser(String userId) {
        return chatRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get chat history by chatId for a specific user (ownership check)
     */
    public List<ChatHistory> getChatHistoryForUser(String userId, String chatId) {
        if (!chatRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("Chat not found or access denied");
        }
        return chatHistoryRepository.findByChatIdOrderByTimestampAsc(chatId);
    }

    /**
     * Save a message in chat history for a chat owned by the user (ownership check)
     */
    public ChatHistory saveMessageForUser(String userId, String chatId, String content, boolean fromUser) {
        if (!chatRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("Chat not found or access denied");
        }
        ChatHistory message = ChatHistory.builder()
                .chatId(chatId)
                .content(content)
                .fromUser(fromUser)
                .timestamp(LocalDateTime.now())
                .build();
        return chatHistoryRepository.save(message);
    }

    /**
     * Process user message: save user message, call LLM, save LLM response
     */
    public String processUserMessage(String userId, String chatId, String userMessage) {
        // Validate chat ownership
        if (!chatRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("Chat not found or access denied");
        }

        // Save user message
        saveMessageForUser(userId, chatId, userMessage, true);

        // Prepare messages for LLM
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", userMessage));

        // Call LLM
        String llmResponse = llmClient.sendMessage(messages);

        // Save LLM response
        saveMessageForUser(userId, chatId, llmResponse, false);

        return llmResponse;
    }

    /**
     * Delete a chat and its history for a user (ownership check)
     */
    @Transactional
    public void deleteChat(String userId, String chatId) {
        if (!chatRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("Chat not found or access denied");
        }
        chatHistoryRepository.deleteByChatId(chatId);
        chatRepository.deleteByChatId(chatId);
    }
}
