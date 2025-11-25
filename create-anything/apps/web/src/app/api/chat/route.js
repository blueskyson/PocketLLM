import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "crypto";

// Helper function to build messages array from conversation messages
function buildMessagesFromHistory(messages) {
  return messages.map((msg) => ({
    role: msg.message_type === "user" ? "user" : "assistant",
    content: msg.content,
  }));
}

// Send a message and get AI response
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { message, conversationId, useCache = true } = body;

    if (!message || message.trim().length === 0) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // Check cache first if enabled
    let cachedResponse = null;
    if (useCache) {
      const queryHash = crypto
        .createHash("sha256")
        .update(trimmedMessage.toLowerCase())
        .digest("hex");
      const cacheResult = await sql`
        SELECT response_text, model_used 
        FROM query_cache 
        WHERE query_hash = ${queryHash}
        LIMIT 1
      `;

      if (cacheResult.length > 0) {
        cachedResponse = cacheResult[0];
        // Update cache hit count and last used time
        await sql`
          UPDATE query_cache 
          SET cache_hit_count = cache_hit_count + 1, last_used_at = NOW()
          WHERE query_hash = ${queryHash}
        `;
      }
    }

    let currentConversationId = conversationId;

    // Create new conversation if none provided
    if (!currentConversationId) {
      // Generate title from first part of message
      const title =
        trimmedMessage.length > 50
          ? trimmedMessage.substring(0, 47) + "..."
          : trimmedMessage;
      const newConversation = await sql`
        INSERT INTO conversations (user_id, title)
        VALUES (${userId}, ${title})
        RETURNING id
      `;
      currentConversationId = newConversation[0].id;
    } else {
      // Verify conversation belongs to user
      const conversationCheck = await sql`
        SELECT id FROM conversations 
        WHERE id = ${currentConversationId} AND user_id = ${userId}
      `;
      if (conversationCheck.length === 0) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    }

    // Store user message
    const userMessage = await sql`
      INSERT INTO messages (conversation_id, user_id, message_type, content)
      VALUES (${currentConversationId}, ${userId}, 'user', ${trimmedMessage})
      RETURNING id, created_at
    `;

    let aiResponse;
    let modelUsed = "Local-LLM";

    if (cachedResponse) {
      // Use cached response
      aiResponse = cachedResponse.response_text;
      modelUsed = cachedResponse.model_used || "Local-LLM (cached)";
    } else {
      // Get conversation history for context
      const conversationHistory = await sql`
        SELECT message_type, content 
        FROM messages 
        WHERE conversation_id = ${currentConversationId} AND user_id = ${userId}
        ORDER BY created_at ASC
      `;

      // Build messages array for local LLM API
      const messages = buildMessagesFromHistory(conversationHistory);

      // Get LLM server URL from environment variable or use defaults
      const customLlmUrl = process.env.LLM_SERVER_URL;

      let llmUrls = [];
      if (customLlmUrl) {
        // If user provided custom URL, try that first
        llmUrls.push(`${customLlmUrl}/v1/chat/completions`);
      }

      // Add default URLs as fallbacks
      llmUrls = llmUrls.concat([
        "http://localhost:8080/v1/chat/completions",
        "http://127.0.0.1:8080/v1/chat/completions",
        "http://host.docker.internal:8080/v1/chat/completions",
      ]);

      let lastError = null;
      let success = false;
      let attemptedUrls = [];

      for (const llmUrl of llmUrls) {
        try {
          console.log(`Attempting to connect to LLM server at: ${llmUrl}`);
          attemptedUrls.push(llmUrl);

          const localLLMResponse = await fetch(llmUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "local-model",
              messages: messages,
              max_tokens: 512,
              temperature: 0.7,
              top_p: 0.9,
            }),
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (!localLLMResponse.ok) {
            const errorData = await localLLMResponse.json().catch(() => ({}));
            throw new Error(
              `LLM API returned ${localLLMResponse.status}: ${errorData.error?.message || localLLMResponse.statusText}`,
            );
          }

          const localResult = await localLLMResponse.json();
          aiResponse =
            localResult.choices?.[0]?.message?.content?.trim() ||
            "I apologize, but I couldn't generate a response. Please try again.";
          modelUsed = localResult.model || "Local-LLM";

          console.log(`Successfully connected to LLM server at: ${llmUrl}`);
          success = true;
          break;
        } catch (error) {
          console.error(`Failed to connect to ${llmUrl}:`, error.message);
          lastError = error;
          continue;
        }
      }

      if (!success) {
        console.error(
          "All LLM server connection attempts failed. Last error:",
          lastError,
        );

        // Create a helpful error message
        let errorMessage = `I can't connect to your local LLM server. I tried these URLs:\n\n`;
        attemptedUrls.forEach((url, index) => {
          errorMessage += `${index + 1}. ${url}\n`;
        });

        errorMessage += `\n**SOLUTION:** Add an environment variable:\n`;
        errorMessage += `• Variable name: \`LLM_SERVER_URL\`\n`;
        errorMessage += `• Value: Your LLM server's public URL\n\n`;
        errorMessage += `**For localhost setup:**\n`;
        errorMessage += `1. Make your LLM server accessible: \`./llama-cpp-server --host 0.0.0.0 --port 8080\`\n`;
        errorMessage += `2. Use your public IP or ngrok tunnel as the LLM_SERVER_URL\n\n`;
        errorMessage += `**Quick test:** Can you access http://YOUR_IP:8080/v1/models from another device?\n\n`;
        errorMessage += `Error details: ${lastError?.message || "Connection failed"}`;

        aiResponse = errorMessage;
      } else {
        // Cache the response for future use
        if (useCache) {
          const queryHash = crypto
            .createHash("sha256")
            .update(trimmedMessage.toLowerCase())
            .digest("hex");
          await sql`
            INSERT INTO query_cache (query_hash, query_text, response_text, model_used)
            VALUES (${queryHash}, ${trimmedMessage}, ${aiResponse}, ${modelUsed})
            ON CONFLICT (query_hash) 
            DO UPDATE SET 
              cache_hit_count = query_cache.cache_hit_count + 1,
              last_used_at = NOW()
          `;
        }
      }
    }

    // Store AI response
    const assistantMessage = await sql`
      INSERT INTO messages (conversation_id, user_id, message_type, content, metadata)
      VALUES (${currentConversationId}, ${userId}, 'assistant', ${aiResponse}, ${JSON.stringify({ model: modelUsed, cached: !!cachedResponse })})
      RETURNING id, created_at
    `;

    // Update conversation timestamp
    await sql`
      UPDATE conversations 
      SET updated_at = NOW() 
      WHERE id = ${currentConversationId}
    `;

    return Response.json({
      conversationId: currentConversationId,
      userMessage: {
        id: userMessage[0].id,
        content: trimmedMessage,
        type: "user",
        created_at: userMessage[0].created_at,
      },
      assistantMessage: {
        id: assistantMessage[0].id,
        content: aiResponse,
        type: "assistant",
        created_at: assistantMessage[0].created_at,
        cached: !!cachedResponse,
        model: modelUsed,
      },
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
