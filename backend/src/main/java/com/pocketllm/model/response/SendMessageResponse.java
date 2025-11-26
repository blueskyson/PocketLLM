
package com.pocketllm.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
public class SendMessageResponse {
    private String chatId;
    private String userMessage;
    private String llmResponse;
    private LocalDateTime timestamp;
}
