import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export interface SessionData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
  } | null;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  } | null;
}

export interface UseSessionReturn {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isPending: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [error, setError] = useState<Error | null>(null);
  const { data: session, isPending, error: authError } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (authError) {
        setError(new Error(authError.message || "Authentication error"));
        setStatus("unauthenticated");
      } else if (session?.user) {
        setStatus("authenticated");
        setError(null);
      } else {
        setStatus("unauthenticated");
        setError(null);
      }
    }
  }, [session, isPending, authError]);

  const refetch = async () => {
    try {
      setError(null);
      setStatus("loading");
      // Trigger refetch by navigating to current page
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refetch session"));
      setStatus("unauthenticated");
    }
  };

  return {
    data: session,
    status,
    isPending,
    error,
    refetch,
  };
}

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return { session, isAuthenticated: status === "authenticated" };
}

// Session management utilities
export const sessionUtils = {
  signOut: async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect even if sign out fails
      window.location.href = "/login";
    }
  },

  signIn: (provider = "github") => {
    return authClient.signIn.social({
      provider: provider as "github",
      callbackURL: "/dashboard",
    });
  },

  getUser: () => {
    const { data } = authClient.useSession();
    return data?.user || null;
  },

  isSessionExpired: (session: SessionData | null) => {
    if (!session?.session?.expiresAt) return true;
    return new Date(session.session.expiresAt) < new Date();
  },
};