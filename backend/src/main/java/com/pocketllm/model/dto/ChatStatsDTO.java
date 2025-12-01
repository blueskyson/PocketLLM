package com.pocketllm.model.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Builder
@Accessors(chain = true)
public class ChatStatsDTO {
    private String chatId;
    private String title;
    private String userEmail;
    private Long messageCount;
    private Long sizeBytes;
}
