
package com.pocketllm.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
public class ChatSummaryResponse {
    private String chatId;
    private String title;
    private LocalDateTime createdAt;
}
