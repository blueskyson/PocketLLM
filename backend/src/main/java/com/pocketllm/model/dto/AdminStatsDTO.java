package com.pocketllm.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long totalConversations;
    private long totalMessages;
    private long cacheEntries;
    private double cacheHitRate;
    private long totalCacheHits;
    private long totalCacheMisses;
    private long messagesToday;
    private long activeConversations;
    private Long avgResponseTime;
    private Long cacheSize;
    private List<Map<String, Object>> topCachedQueries;
}
