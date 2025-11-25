import { getCookieValue, deleteSession } from "@/app/api/utils/auth";

export async function POST(request) {
  try {
    const cookies = request.headers.get("cookie");
    const sessionToken = getCookieValue(cookies, "session");

    if (sessionToken) {
      deleteSession(sessionToken);
    }

    // Create response that clears the session cookie
    const response = Response.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
