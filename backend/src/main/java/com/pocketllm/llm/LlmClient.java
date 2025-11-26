
package com.pocketllm.llm;

import com.pocketllm.util.HttpClientUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class LlmClient {

    private final HttpClientUtil httpClientUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${llm.client.url:http://localhost:8081/v1/chat/completions}")
    private String llmUrl;

    @Value("${llm.client.timeout:30s}")
    private Duration llmTimeout;

    @Value("${llm.client.model:local-model}")
    private String llmModel;

    public LlmClient(HttpClientUtil httpClientUtil) {
        this.httpClientUtil = httpClientUtil;
    }

    public String sendMessage(List<Map<String, String>> messages) {
        try {
            // Prepare payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", llmModel);
            payload.put("messages", messages);
            payload.put("max_tokens", 512);
            payload.put("temperature", 0.7);
            payload.put("top_p", 0.9);

            String jsonBody = mapper.writeValueAsString(payload);

            // Use HttpClientUtil for POST with timeout
            String response = httpClientUtil.postJson(llmUrl, jsonBody);

            // Parse response
            Map<String, Object> result = mapper.readValue(response, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) result.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
            return "I apologize, but I couldn't generate a response.";
        } catch (Exception e) {
            return "Error connecting to LLM: " + e.getMessage();
        }
    }
}
