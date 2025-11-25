import { hash } from "argon2";
import { users, createSession, generateUserId } from "@/app/api/utils/auth";

export async function signUpUser(email, password, name) {
  if (users.has(email)) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hash(password);
  const user = {
    id: generateUserId(),
    email,
    name: name || null,
    password: hashedPassword,
    emailVerified: null,
    image: null,
  };

  users.set(email, user);
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
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await signUpUser(email, password, name);
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
    console.error("Sign up error:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
