package com.pocketllm.repository;

import com.pocketllm.model.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository

public interface ChatRepository extends JpaRepository<Chat, Long> {
    // Retrieve all chats for a user, sorted by creation date (latest first)
    List<Chat> findByUserIdOrderByCreatedAtDesc(String userId);

    // Find a chat by its unique chatId
    Optional<Chat> findByChatId(String chatId);

    // Verify ownership for deletion/authorization
    boolean existsByChatIdAndUserId(String chatId, String userId);

    // Hard delete by chatId
    void deleteByChatId(String chatId);

    int countByUserId(String userId);
    int countByCreatedAtAfter(LocalDateTime time);
}


