package com.pocketllm.repository;

import com.pocketllm.model.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    // Retrieve all chats for a user, sorted by creation date (latest first)
    List<Chat> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Optional: Find a chat by its unique chatId
    Optional<Chat> findByChatId(String chatId);
}

