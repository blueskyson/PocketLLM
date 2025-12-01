package com.pocketllm.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatStatsDTO {
    private Long chatId;
    private String title;
    private String userEmail;
    private Long messageCount;
    private Long sizeBytes;
}
