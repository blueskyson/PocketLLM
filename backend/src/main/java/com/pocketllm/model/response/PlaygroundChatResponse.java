package com.pocketllm.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class PlaygroundChatResponse {
    private String result;
}

