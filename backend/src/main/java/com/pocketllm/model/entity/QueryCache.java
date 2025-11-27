package com.pocketllm.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Entity
@Table(name = "query_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 2000)
    private String userQuery;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String llmResponse;

    private LocalDateTime createdAt;

    private LocalDateTime lastAccessedAt;

    private int hitCount;
}

