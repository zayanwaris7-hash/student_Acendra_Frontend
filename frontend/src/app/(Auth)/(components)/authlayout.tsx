
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    if (accessToken && refreshToken && isAuthenticated) {
      router.replace("/student/dashboard");
    }
  }, [
    hydrated,
    accessToken,
    refreshToken,
    isAuthenticated,
    router,
  ]);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (accessToken && refreshToken && isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
