
package com.pocketllm.service;

import com.pocketllm.model.entity.Chat;
import com.pocketllm.model.entity.ChatHistory;
import com.pocketllm.repository.ChatRepository;
import com.pocketllm.repository.ChatHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    public ChatService(ChatRepository chatRepository, ChatHistoryRepository chatHistoryRepository) {
        this.chatRepository = chatRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    /**
     * Create a new chat for a user
     */
    public Chat createChat(Integer userId, String title) {
        Chat chat = Chat.builder()
                .userId(userId)
                .title(title)
                .chatId(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .build();
        return chatRepository.save(chat);
    }

    /**
     * Save a message in chat history
     */
    public ChatHistory saveMessage(String chatId, String content, boolean fromUser) {
        ChatHistory message = ChatHistory.builder()
                .chatId(chatId)
                .content(content)
                .fromUser(fromUser)
                .timestamp(LocalDateTime.now())
                .build();
        return chatHistoryRepository.save(message);
    }

    /**
     * Get all chats for a user
     */
    public List<Chat> getChatsForUser(Integer userId) {
        return chatRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get chat history sorted by timestamp
     */
    public List<ChatHistory> getChatHistory(String chatId) {
        return chatHistoryRepository.findByChatIdOrderByTimestampAsc(chatId);
    }
}
