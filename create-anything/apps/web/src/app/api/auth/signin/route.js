import { hash, verify } from "argon2";
import { users, createSession } from "@/app/api/utils/auth";

export async function signInUser(email, password) {
  const user = users.get(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await verify(user.password, password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: user.image,
  };
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await signInUser(email, password);
    const { sessionToken, expires } = createSession(user);

    // Create response with session cookie
    const response = Response.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    // Set session cookie
    response.headers.set(
      "Set-Cookie",
      `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`,
    );

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return Response.json({ error: error.message }, { status: 401 });
  }
}
