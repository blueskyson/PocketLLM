package com.pocketllm.repository;

import com.pocketllm.model.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    // Retrieve all messages for a chat, sorted by timestamp (oldest first)
    List<ChatHistory> findByChatIdOrderByTimestampAsc(String chatId);

    // Hard delete all history for a chat
    void deleteByChatId(String chatId);
}



