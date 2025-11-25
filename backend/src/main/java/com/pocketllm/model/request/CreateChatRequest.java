
package com.pocketllm.model.request;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class CreateChatRequest {
    private Integer userId;
    private String title;
}
