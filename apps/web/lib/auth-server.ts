import { redirect } from "next/navigation";
import { authClient } from "./auth-client";

// Server-side auth helper for Next.js with separate Hono API
export async function getServerSession() {
  try {
    // Make request to your Hono API to validate session
    const response = await authClient.getSession();

    console.log("Server session response:", response);

    if (!response || response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Server session error:", error);
    return null;
  }
}

export async function requireServerAuth() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  return session;
}

// Helper to get just the user data
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}
