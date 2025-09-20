import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "./auth-client";

// Server-side auth helper for Next.js using Better-Auth
export async function getServerSession() {
  try {
    // Get the session using Better-Auth's server-side method
    const { data, error } = await authClient.getSession();

    if (error) {
      console.error("Server session error:", error);
      return null;
    }

    return data;
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
