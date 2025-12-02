package com.pocketllm.service;

import com.pocketllm.model.entity.ApiKey;
import com.pocketllm.model.response.ApiKeyResponse;
import com.pocketllm.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyService {

    private static final int RAW_KEY_BYTES = 32;
    private final ApiKeyRepository apiKeyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public ApiKeyResponse createKey(String userId, String keyName) {
        String plaintextKey = generateRawKey();
        ApiKey apiKey = ApiKey.builder()
                .userId(userId)
                .keyName(keyName)
                .secret(plaintextKey)
                .build();
        ApiKey saved = apiKeyRepository.save(apiKey);
        log.info("API key created for user={} keyId={}", userId, saved.getUuid());
        ApiKeyResponse response = toResponse(saved);
        response.setApiKey(plaintextKey);
        return response;
    }

    public List<ApiKeyResponse> listKeys(String userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteKey(String userId, String keyId) {
        ApiKey apiKey = apiKeyRepository.findByUuidAndUserId(keyId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Key not found"));
        apiKeyRepository.delete(apiKey);
        log.info("API key deleted for user={} keyId={}", userId, keyId);
    }

    private String generateRawKey() {
        byte[] bytes = new byte[RAW_KEY_BYTES];
        secureRandom.nextBytes(bytes);
        return "pk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private ApiKeyResponse toResponse(ApiKey apiKey) {
        return ApiKeyResponse.builder()
                .keyId(apiKey.getUuid())
                .keyName(apiKey.getKeyName())
                .apiKey(apiKey.getSecret())
                .createdAt(apiKey.getCreatedAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .build();
    }
}

