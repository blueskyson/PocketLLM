package com.pocketllm.controller;

import com.pocketllm.model.dto.AdminStatsDTO;
import com.pocketllm.model.dto.ChatStatsDTO;
import com.pocketllm.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/chats")
    public ResponseEntity<List<ChatStatsDTO>> getAllChatStats() {
        return ResponseEntity.ok(adminService.getChatStats());
    }

    @DeleteMapping("/chats/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable String chatId) {
        adminService.deleteChat(chatId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cache")
    public ResponseEntity<Void> deleteAllCache() {
        adminService.deleteCache();
        return ResponseEntity.noContent().build();
    }
}