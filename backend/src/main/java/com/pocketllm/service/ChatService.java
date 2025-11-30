package com.pocketllm.service;

import com.pocketllm.model.entity.Chat;
import com.pocketllm.model.entity.ChatHistory;
import com.pocketllm.model.entity.QueryCache;
import com.pocketllm.repository.ChatRepository;
import com.pocketllm.repository.ChatHistoryRepository;
import com.pocketllm.repository.QueryCacheRepository;
import com.pocketllm.llm.LlmClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final QueryCacheRepository queryCacheRepository;
    private final LlmClient llmClient;

    public ChatService(ChatRepository chatRepository,
                       ChatHistoryRepository chatHistoryRepository,
                       QueryCacheRepository queryCacheRepository,
                       LlmClient llmClient) {
        this.chatRepository = chatRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.queryCacheRepository = queryCacheRepository;
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
     * Process user message: check cache first, then call LLM if not cached
     */
    public String processUserMessage(String userId, String chatId, String userMessage) {
        // 1. Validate chat ownership
        if (!chatRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("Chat not found or access denied");
        }

        // 2. Save user message to chat history
        saveMessageForUser(userId, chatId, userMessage, true);

        // 3. Normalize query for cache lookup (trim and lowercase)
        String normalizedQuery = userMessage.trim().toLowerCase();

        String llmResponse;

        // 4. Check cache first
        
        if(!queryCacheRepository.existsByUserQuery(normalizedQuery)) {
            // Cache MISS: call LLM
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", userMessage));
            llmResponse = llmClient.sendMessage(messages);

            // Save to cache for future queries
            QueryCache newCache = QueryCache.builder()
                    .userQuery(normalizedQuery)
                    .llmResponse(llmResponse)
                    .createdAt(LocalDateTime.now())
                    .lastAccessedAt(LocalDateTime.now())
                    .hitCount(0)
                    .build();
            queryCacheRepository.save(newCache);
        } else {
            // Cache HIT: use cached response
            Optional<QueryCache> cachedResponse = queryCacheRepository.findByUserQuery(normalizedQuery);

            QueryCache cache = cachedResponse.get();
            llmResponse = "*** FROM CACHE ***\n" +cache.getLlmResponse();

            // Update cache statistics
            cache.setLastAccessedAt(LocalDateTime.now());
            cache.setHitCount(cache.getHitCount() + 1);
            queryCacheRepository.save(cache);
        }

       
        // 5. Save LLM response to chat history
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

    /**
     * Clear all query cache entries
     */
    @Transactional
    public void clearQueryCache() {
        queryCacheRepository.deleteAll();
    }

}
