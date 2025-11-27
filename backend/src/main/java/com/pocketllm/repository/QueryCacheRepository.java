package com.pocketllm.repository;

import com.pocketllm.model.entity.QueryCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QueryCacheRepository extends JpaRepository<QueryCache, Long> {

    /**
     * Find cached response by exact user query match (normalized)
     */
    Optional<QueryCache> findByUserQuery(String userQuery);

    /**
     * Check if query exists in cache
     */
    boolean existsByUserQuery(String userQuery);

    /**
     * Delete all cache entries
     */

    void deleteAll();
}