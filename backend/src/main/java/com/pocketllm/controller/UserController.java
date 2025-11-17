package com.pocketllm.controller;

import com.pocketllm.model.entity.User;
import com.pocketllm.model.req.CreateUserReq;
import com.pocketllm.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository repo;

    // CREATE
    @PostMapping
    public User createUser(@RequestBody @Valid CreateUserReq req) {
        User user = new User();
        user.setName(req.getName());
        return repo.save(user);
    }

    // READ all
    @GetMapping
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // READ by uuid
    @GetMapping("/{uuid}")
    public ResponseEntity<User> getUser(@PathVariable String uuid) {
        Optional<User> found = repo.findByUuid(uuid);
        return found.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // UPDATE
    @PutMapping("/{uuid}")
    public ResponseEntity<User> updateUser(
            @PathVariable String uuid,
            @RequestBody @Valid CreateUserReq updatedUser) {

        Optional<User> optionalUser = repo.findByUuid(uuid);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        user.setName(updatedUser.getName());
        repo.save(user);

        return ResponseEntity.ok(user);
    }

    // DELETE
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteUser(@PathVariable String uuid) {
        Optional<User> optionalUser = repo.findByUuid(uuid);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        repo.delete(optionalUser.get());
        return ResponseEntity.noContent().build();
    }
}

