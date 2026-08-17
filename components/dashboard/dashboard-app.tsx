"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AdminGalleryPanel } from "@/components/dashboard/admin-gallery-panel";
import { AdminInquiriesPanel } from "@/components/dashboard/admin-dashboard";
import { AdminStoriesPanel } from "@/components/dashboard/admin-stories-panel";
import { AdminWebsitePanel } from "@/components/dashboard/admin-website-panel";
import { AdminWorkPanel } from "@/components/dashboard/admin-work-panel";
import { ClientInquiriesPanel } from "@/components/dashboard/client-inquiries-panel";
import { ClientWorkPanel } from "@/components/dashboard/client-work-panel";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { inquiryIsActive } from "@/components/dashboard/inquiry-detail";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import type { DashboardSectionId } from "@/data/dashboard-nav";
import {
  getAllSubmissions,
  getClientSubmissions,
  linkUnclaimedSubmissionsForUser,
} from "@/lib/firebase/submissions";
import type { UserProfile } from "@/types/user";

type DashboardAppProps = {
  section: DashboardSectionId;
};

function DashboardContent({
  user,
  section,
}: {
  user: UserProfile;
  section: DashboardSectionId;
}) {
  const isAdmin = user.role === "admin";
  const router = useRouter();
  const [inquiryCount, setInquiryCount] = useState(0);
  const [activeInquiryCount, setActiveInquiryCount] = useState(0);
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  useEffect(() => {
    if (!isAdmin && (section === "gallery" || section === "stories" || section === "website" || section === "messages")) {
      router.replace("/studio/dashboard");
    }
  }, [isAdmin, router, section]);

  useEffect(() => {
    if (section !== "overview") return;

    let cancelled = false;

    async function loadStats() {
      try {
        if (isAdmin) {
          const results = await getAllSubmissions();
          if (cancelled) return;
          setInquiryCount(results.length);
          setActiveInquiryCount(
            results.filter((item) => inquiryIsActive(item.status)).length,
          );
          setNewInquiryCount(
            results.filter((item) => item.status === "new").length,
          );
          return;
        }

        await linkUnclaimedSubmissionsForUser(user.uid, user.email);
        const results = await getClientSubmissions(user.uid, user.email);
        if (cancelled) return;
        setInquiryCount(results.length);
        setActiveInquiryCount(
          results.filter((item) => inquiryIsActive(item.status)).length,
        );
        setNewInquiryCount(0);
      } catch {
        if (!cancelled) {
          setInquiryCount(0);
          setActiveInquiryCount(0);
          setNewInquiryCount(0);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, section, user.email, user.uid]);

  if (!isAdmin && (section === "gallery" || section === "stories" || section === "website" || section === "messages")) {
    return null;
  }

  switch (section) {
    case "overview":
      return (
        <OverviewPanel
          user={user}
          inquiryCount={inquiryCount}
          activeInquiryCount={activeInquiryCount}
          newInquiryCount={newInquiryCount}
        />
      );
    case "inquiries":
      return isAdmin ? (
        <AdminInquiriesPanel />
      ) : (
        <ClientInquiriesPanel user={user} />
      );
    case "gallery":
      return <AdminGalleryPanel />;
    case "stories":
      return <AdminStoriesPanel />;
    case "website":
      return <AdminWebsitePanel />;
    case "messages":
      return <ComingSoonPanel section={section} />;
    case "work":
      return isAdmin ? (
        <AdminWorkPanel />
      ) : (
        <ClientWorkPanel user={user} />
      );
    default:
      return (
        <OverviewPanel
          user={user}
          inquiryCount={inquiryCount}
          activeInquiryCount={activeInquiryCount}
          newInquiryCount={newInquiryCount}
        />
      );
  }
}

function DashboardShell({ section }: DashboardAppProps) {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout user={user} onSignOut={signOut}>
      <DashboardContent user={user} section={section} />
    </DashboardLayout>
  );
}

export function DashboardApp({ section }: DashboardAppProps) {
  return (
    <AuthGuard>
      <DashboardShell section={section} />
    </AuthGuard>
  );
}

export default DashboardApp;
