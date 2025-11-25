import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all conversations for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const conversations = await sql`
      SELECT id, title, created_at, updated_at
      FROM conversations 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return Response.json({ conversations });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new conversation
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title } = body;

    const result = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${title || "New Conversation"})
      RETURNING id, title, created_at, updated_at
    `;

    const conversation = result[0];
    return Response.json({ conversation });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
