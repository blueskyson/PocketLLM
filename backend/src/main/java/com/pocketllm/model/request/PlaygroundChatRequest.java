package com.pocketllm.model.request;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class PlaygroundChatRequest {
    private String model;
    private List<PlaygroundMessage> messages;

    @Data
    @Accessors(chain = true)
    public static class PlaygroundMessage {
        private String role;
        private String content;
    }
}

