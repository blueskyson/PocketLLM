package com.pocketllm.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class AuthResponse {
    private String sessionId;

    public AuthResponse(String sessionId) {
        this.sessionId = sessionId;
    }
}
