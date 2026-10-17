import type { UserRole } from "@/types/user";

export type DashboardSectionId =
  | "overview"
  | "inquiries"
  | "gallery"
  | "stories"
  | "website"
  | "quote"
  | "work"
  | "messages";

export type DashboardNavItem = {
  id: DashboardSectionId;
  label: string;
  href: string;
  description: string;
  roles: UserRole[];
  comingSoon?: boolean;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/studio/dashboard",
    description: "Summary and quick access",
    roles: ["admin", "client"],
  },
  {
    id: "inquiries",
    label: "Inquiries",
    href: "/studio/dashboard/inquiries",
    description: "Client inquiries and status",
    roles: ["admin", "client"],
  },
  {
    id: "gallery",
    label: "Gallery",
    href: "/studio/dashboard/gallery",
    description: "Manage portfolio projects, photos, and film",
    roles: ["admin"],
  },
  {
    id: "stories",
    label: "Stories",
    href: "/studio/dashboard/stories",
    description: "Manage wedding story posts",
    roles: ["admin"],
  },
  {
    id: "website",
    label: "Website",
    href: "/studio/dashboard/website",
    description: "Homepage hero carousel and site content",
    roles: ["admin"],
  },
  {
    id: "quote",
    label: "Quote",
    href: "/studio/dashboard/quote",
    description: "Instant quote rates, add-ons, and rules",
    roles: ["admin"],
  },
  {
    id: "work",
    label: "Work",
    href: "/studio/dashboard/work",
    description: "Work orders and project progress",
    roles: ["admin", "client"],
  },
  {
    id: "messages",
    label: "Messages",
    href: "/studio/dashboard/messages",
    description: "Studio communication",
    roles: ["admin"],
    comingSoon: true,
  },
];

export function getDashboardNavForRole(role: UserRole): DashboardNavItem[] {
  return DASHBOARD_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function getDashboardNavItem(
  section: DashboardSectionId,
): DashboardNavItem | undefined {
  return DASHBOARD_NAV_ITEMS.find((item) => item.id === section);
}
