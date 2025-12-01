package com.pocketllm.service;

import com.pocketllm.SessionStore;
import com.pocketllm.model.entity.User;
import com.pocketllm.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SessionStore sessionStore;

    public AuthService(UserRepository userRepository, SessionStore sessionStore) {
        this.userRepository = userRepository;
        this.sessionStore = sessionStore;
    }

    public String signUp(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // TODO: encrypt later
        userRepository.save(user);

        return sessionStore.createSession(user.getUuid());
    }

    public String login(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(u -> rawPassword.equals(u.getPassword()))
                .map(u -> sessionStore.createSession(u.getUuid()))   // 產生 session
                .orElse(null);
    }

    public String validateSession(String sessionId) {
        return sessionStore.getUserId(sessionId);
    }
}

