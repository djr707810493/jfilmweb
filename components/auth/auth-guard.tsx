"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/studio/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="label-editorial text-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
