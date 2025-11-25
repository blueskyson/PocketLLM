import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get a specific conversation with its messages
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = params.id;

    // Get conversation details
    const conversations = await sql`
      SELECT id, title, created_at, updated_at
      FROM conversations 
      WHERE id = ${conversationId} AND user_id = ${userId}
    `;

    if (conversations.length === 0) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Get messages for this conversation
    const messages = await sql`
      SELECT id, message_type, content, metadata, created_at
      FROM messages 
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
      ORDER BY created_at ASC
    `;

    const conversation = conversations[0];
    return Response.json({ conversation: { ...conversation, messages } });
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update conversation title
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = params.id;
    const body = await request.json();
    const { title } = body;

    if (!title || title.trim().length === 0) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE conversations 
      SET title = ${title.trim()}, updated_at = NOW()
      WHERE id = ${conversationId} AND user_id = ${userId}
      RETURNING id, title, created_at, updated_at
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const conversation = result[0];
    return Response.json({ conversation });
  } catch (error) {
    console.error("PUT /api/conversations/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a conversation
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = params.id;

    const result = await sql`
      DELETE FROM conversations 
      WHERE id = ${conversationId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
