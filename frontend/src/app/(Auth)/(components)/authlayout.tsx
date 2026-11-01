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
    if (
      hydrated &&
      accessToken &&
      refreshToken &&
      isAuthenticated
    ) {
      router.replace("/student/dashboard");
    }
  }, [
    hydrated,
    accessToken,
    refreshToken,
    isAuthenticated,
    router,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        {hydrated ? (
          accessToken && refreshToken && isAuthenticated ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            children
          )
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </main>
  );
}