# PocketLLM Portal

A self-hosted chat application with local LLM inference, query caching, admin dashboard, and API playground.

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │───▶│   Backend    │───▶│  LLM Server  │
│  React+Vite  │    │ Spring Boot  │    │  llama.cpp   │
│   :4000      │    │    :8080     │    │    :8081     │
└──────────────┘    └──────┬───────┘    └──────────────┘
                          │
                    ┌─────▼─────┐
                    │ Database. │
                    └───────────┘
```

## Quick Start

```bash
# Clone and start
git clone <repository-url>
cd PocketLLM
docker-compose up --build
```

**Access:**
- http://localhost:4000/account/signup

## Features

### Chat
- User authentication (signup/login)
- Multi-conversation management
- Local LLM inference (Phi-3-mini)
- Query caching for instant responses

### Admin Dashboard
- System stats (users, messages, cache)
- Cache performance metrics
- Chat management (view/delete)
- Cache control (clear all)

### API Playground
- API key generation
- Interactive LLM testing
- Code examples (curl, Python, JS)
- Usage tracking

## API Reference

### Authentication
```bash
# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

### Chat
```bash
# Create chat
curl -X POST http://localhost:8080/api/chat/create \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <SESSION_ID>" \
  -d '{"title": "My Chat"}'

# Send message
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <SESSION_ID>" \
  -d '{"chatId": "<CHAT_ID>", "content": "Hello!"}'
```

### Admin
```bash
# Get stats
curl http://localhost:8080/api/admin/stats \
  -H "X-Session-Id: <ADMIN_SESSION_ID>"

# Clear cache
curl -X DELETE http://localhost:8080/api/admin/cache \
  -H "X-Session-Id: <ADMIN_SESSION_ID>"
```

### API Playground
```bash
# Create API key
curl -X POST http://localhost:8080/api/keys/create \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <SESSION_ID>" \
  -d '{"name": "My Key"}'

# Use API key
curl -X POST http://localhost:8080/api/playground/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{"message": "What is AI?"}'
```

## Requirements

- Docker & Docker Compose
- 4 vCPUs, 16 GB RAM


## Team

CSCI 578 - Software Architectures, Fall 2025
