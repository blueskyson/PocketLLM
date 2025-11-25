import { hash } from "argon2";
import { users, createSession } from "@/app/api/utils/auth";

export async function POST(request) {
  try {
    // Create a test user
    const testEmail = "test@example.com";
    const testPassword = "password123";
    const hashedPassword = await hash(testPassword);

    const user = {
      id: 1,
      email: testEmail,
      name: "Test User",
      password: hashedPassword,
      emailVerified: null,
      image: null,
    };

    users.set(testEmail, user);

    return Response.json({
      success: true,
      message: "Test user created",
      user: { id: user.id, email: user.email, name: user.name },
      credentials: { email: testEmail, password: testPassword },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  return Response.json({
    message: "Auth system status",
    usersCount: users.size,
    users: Array.from(users.keys()),
  });
}
