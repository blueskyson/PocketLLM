// Shared authentication utilities for the simple in-memory auth system

// Note: This is a shared storage that should be imported by all auth-related API routes
export let users = new Map(); // email -> user object
export let sessions = new Map(); // sessionToken -> { user, expires }
export let userIdCounter = 1;

// Helper functions
export function generateSessionToken() {
  return crypto.randomUUID();
}

export function generateUserId() {
  return userIdCounter++;
}

export function getCookieValue(cookies, name) {
  if (!cookies) return null;

  const cookieArray = cookies.split(";");
  for (let cookie of cookieArray) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return value;
    }
  }
  return null;
}

export function getSession(sessionToken) {
  if (!sessionToken) return null;

  const session = sessions.get(sessionToken);
  if (!session) return null;

  if (new Date() > session.expires) {
    sessions.delete(sessionToken);
    return null;
  }

  return session;
}

export function createSession(user) {
  const sessionToken = generateSessionToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  sessions.set(sessionToken, {
    user,
    expires,
  });

  return { sessionToken, expires };
}

export function deleteSession(sessionToken) {
  if (sessionToken) {
    sessions.delete(sessionToken);
  }
}

// Helper function to get session from request headers
export function getSessionFromRequest(request) {
  try {
    const cookies = request.headers.get("cookie");
    const sessionToken = getCookieValue(cookies, "session");

    if (!sessionToken) {
      return null;
    }

    return getSession(sessionToken);
  } catch (error) {
    console.error("Error getting session from request:", error);
    return null;
  }
}
