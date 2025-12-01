package com.pocketllm.service;

import com.pocketllm.model.dto.AdminStatsDTO;
import com.pocketllm.model.dto.ChatStatsDTO;
import com.pocketllm.model.entity.ChatHistory;
import com.pocketllm.repository.ChatHistoryRepository;
import com.pocketllm.repository.ChatRepository;
import com.pocketllm.repository.QueryCacheRepository;
import com.pocketllm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final QueryCacheRepository queryCacheRepository;

    public AdminService(
            UserRepository userRepository,
            ChatRepository chatRepository,
            ChatHistoryRepository chatHistoryRepository,
            QueryCacheRepository queryCacheRepository) {
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.queryCacheRepository = queryCacheRepository;
    }

    public AdminStatsDTO getStats() {
        long totalUsers = userRepository.count();
        long totalConversations = chatRepository.count();
        long totalMessages = chatHistoryRepository.count();

        long cacheEntries = queryCacheRepository.count();
        Integer hitSum = queryCacheRepository.sumTotalHits();
        long totalCacheHits = hitSum == null ? 0 : hitSum;

        // Cache misses = rows with hitCount = 0
        Integer missSum = queryCacheRepository.countMisses();
        long totalCacheMisses = missSum == null ? 0 : missSum;

        double hitRate = (totalCacheHits + totalCacheMisses) == 0
                ? 0
                : (double) totalCacheHits / (totalCacheHits + totalCacheMisses);

        long messagesToday = chatHistoryRepository.countByTimestampAfter(LocalDateTime.now().minusDays(1));

        // active conversations = last 1 hour
        long activeConversations = chatHistoryRepository.findAll().stream()
                .filter(h -> h.getTimestamp().isAfter(LocalDateTime.now().minusHours(1)))
                .map(ChatHistory::getChatId)
                .distinct()
                .count();

        // cache size = all llmResponses length sum
        long cacheSize = queryCacheRepository.findAll().stream()
                .mapToLong(c -> c.getLlmResponse().length())
                .sum();

        // top cached queries
        List<Map<String, Object>> topQueries = queryCacheRepository.findTop10ByOrderByHitCountDesc()
                .stream()
                .map(q -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("query", q.getUserQuery());
                    m.put("hits", q.getHitCount());
                    return m;
                })
                .toList();

        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalConversations(totalConversations)
                .totalMessages(totalMessages)
                .cacheEntries(cacheEntries)
                .cacheHitRate(hitRate)
                .totalCacheHits(totalCacheHits)
                .totalCacheMisses(totalCacheMisses)
                .messagesToday(messagesToday)
                .activeConversations(activeConversations)
                .avgResponseTime(null)
                .cacheSize(cacheSize)
                .topCachedQueries(topQueries)
                .build();
    }

    public List<ChatStatsDTO> getChatStats() {
        return chatRepository.findAllChatStats();
    }

    @Transactional
    public void deleteChat(String chatId) {
        chatHistoryRepository.deleteByChatId(chatId);
        chatRepository.deleteByChatId(chatId);
    }
}
