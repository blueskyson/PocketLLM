import { getSessionFromRequest } from "@/app/api/utils/auth";

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return Response.json({ user: null });
    }

    return Response.json({ user: session.user });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ user: null });
  }
}
