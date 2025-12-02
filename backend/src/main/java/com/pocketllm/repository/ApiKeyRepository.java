package com.pocketllm.repository;

import com.pocketllm.model.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<ApiKey> findByUuidAndUserId(String uuid, String userId);
    void deleteByUuidAndUserId(String uuid, String userId);
    Optional<ApiKey> findBySecret(String secret);
}

