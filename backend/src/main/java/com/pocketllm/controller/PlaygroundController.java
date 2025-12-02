package com.pocketllm.controller;

import com.pocketllm.llm.LlmClient;
import com.pocketllm.model.entity.ApiKey;
import com.pocketllm.model.request.PlaygroundChatRequest;
import com.pocketllm.model.response.PlaygroundChatResponse;
import com.pocketllm.repository.ApiKeyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/playground")
@Slf4j
public class PlaygroundController {

    private final ApiKeyRepository apiKeyRepository;
    private final LlmClient llmClient;

    public PlaygroundController(ApiKeyRepository apiKeyRepository, LlmClient llmClient) {
        this.apiKeyRepository = apiKeyRepository;
        this.llmClient = llmClient;
    }

    @PostMapping("/chat")
    public ResponseEntity<PlaygroundChatResponse> chat(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody PlaygroundChatRequest request
    ) {
        Optional<ApiKey> apiKey = resolveApiKey(authorization);
        if (apiKey.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        if (request.getMessages() == null || request.getMessages().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Map<String, String>> messages = request.getMessages().stream()
                .map(msg -> Map.of(
                        "role", normalizeRole(msg.getRole()),
                        "content", msg.getContent() == null ? "" : msg.getContent()
                ))
                .collect(Collectors.toList());

        String llmResponse = llmClient.sendMessage(messages);
        log.info("Playground chat processed via apiKey={}", apiKey.get().getUuid());
        return ResponseEntity.ok(new PlaygroundChatResponse().setResult(llmResponse));
    }

    private Optional<ApiKey> resolveApiKey(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            return Optional.empty();
        }
        return apiKeyRepository.findBySecret(token);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "user";
        }
        return role;
    }
}

