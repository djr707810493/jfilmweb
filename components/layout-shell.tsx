"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/studio/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
