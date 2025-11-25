
package com.pocketllm.model.request;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class SaveMessageRequest {
    private String chatId;
    private String content;
    private boolean fromUser;
}
