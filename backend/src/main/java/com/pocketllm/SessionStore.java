package com.pocketllm;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionStore {
    private final Map<String, String> sessions = new ConcurrentHashMap<>();

    public String createSession(String userId) {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, userId);
        return sessionId;
    }

    public String getUserId(String sessionId) {
        return sessions.get(sessionId);
    }

    public void deleteSession(String sessionId) {
        sessions.remove(sessionId);
    }
}
