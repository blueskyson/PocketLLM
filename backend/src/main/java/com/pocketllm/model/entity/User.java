package com.pocketllm.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;  // SQLite primary key

    @Column(nullable = false, unique = true)
    private String uuid; // Public ID

    @Column(nullable = false)
    private String name;

    public User() {
        this.uuid = UUID.randomUUID().toString();
    }

    // Getters and setters

    public Integer getId() {
        return id;
    }

    public String getUuid() {
        return uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

