
package com.pocketllm.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
public class SaveMessageResponse {
    private Long id;
    private String chatId;
    private String content;
    private boolean fromUser;
    private LocalDateTime timestamp;
}
