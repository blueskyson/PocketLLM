package com.pocketllm.controller;

import com.pocketllm.model.entity.User;
import com.pocketllm.model.request.LoginRequest;
import com.pocketllm.model.request.SignupRequest;
import com.pocketllm.model.response.AuthResponse;
import com.pocketllm.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignupRequest request) {
        try {
            String sessionId = authService.signUp(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(new AuthResponse(sessionId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String sessionId = authService.login(request.getEmail(), request.getPassword());

        if (sessionId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        return ResponseEntity.ok(new AuthResponse(sessionId));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader("X-Session-Id") String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        User user = authService.validateSessionAndGetUser(sessionId);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        boolean isAdmin = user.getEmail().equals("admin");
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "isAdmin", isAdmin
        ));
    }
}
