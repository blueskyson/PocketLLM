package com.pocketllm.model.response;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Builder
@Accessors(chain = true)
public class ApiKeyResponse {
    private String keyId;
    private String keyName;
    private String apiKey;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
}

