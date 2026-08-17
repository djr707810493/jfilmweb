export type UserRole = "admin" | "client";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
}
