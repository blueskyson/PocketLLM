package com.pocketllm.controller;

import com.pocketllm.SessionStore;
import com.pocketllm.model.request.CreateApiKeyRequest;
import com.pocketllm.model.response.ApiKeyResponse;
import com.pocketllm.service.ApiKeyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/apikey")
@Slf4j
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final SessionStore sessionStore;

    public ApiKeyController(ApiKeyService apiKeyService, SessionStore sessionStore) {
        this.apiKeyService = apiKeyService;
        this.sessionStore = sessionStore;
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> listKeys(@RequestHeader("X-Session-Id") String sessionId) {
        String userId = resolveUser(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(apiKeyService.listKeys(userId));
    }

    @PostMapping
    public ResponseEntity<ApiKeyResponse> createKey(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestBody CreateApiKeyRequest request
    ) {
        String userId = resolveUser(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        if (request.getKeyName() == null || request.getKeyName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ApiKeyResponse response = apiKeyService.createKey(userId, request.getKeyName());
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{keyId}")
    public ResponseEntity<Void> deleteKey(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable String keyId
    ) {
        String userId = resolveUser(sessionId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            apiKeyService.deleteKey(userId, keyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            log.warn("Attempt to delete missing key user={} key={}", userId, keyId);
            return ResponseEntity.notFound().build();
        }
    }

    private String resolveUser(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }
        return sessionStore.getUserId(sessionId);
    }
}

