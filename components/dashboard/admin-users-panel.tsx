"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  DashboardPageHeader,
  DashboardStat,
  dashboardInputClass,
} from "@/components/dashboard/dashboard-layout";
import {
  deleteUserProfile,
  formatUserDate,
  getAllUsers,
  updateUserDisplayName,
} from "@/lib/firebase/users";
import type { UserProfile } from "@/types/user";

export function AdminUsersPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getAllUsers());
    } catch {
      setError("Could not load users. Check Firestore rules and admin access.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      `${user.displayName ?? ""} ${user.email}`.toLowerCase().includes(term),
    );
  }, [search, users]);

  function startEdit(user: UserProfile) {
    setEditing(user);
    setDisplayName(user.displayName ?? "");
    setActionError("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setActionError("");
    try {
      await updateUserDisplayName(editing.uid, displayName);
      setUsers((current) => current.map((user) =>
        user.uid === editing.uid
          ? { ...user, displayName: displayName.trim() || undefined }
          : user,
      ));
      setEditing(null);
    } catch {
      setActionError("Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(user: UserProfile) {
    if (user.uid === currentUserId) {
      setActionError("You cannot remove your own account.");
      return;
    }
    if (!window.confirm(`Remove the profile for ${user.email}? This does not delete their Firebase Authentication account.`)) {
      return;
    }
    setActionError("");
    try {
      await deleteUserProfile(user.uid);
      setUsers((current) => current.filter((item) => item.uid !== user.uid));
    } catch {
      setActionError("Could not remove user profile.");
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Admin Workspace"
        title="Users"
        description="View client account profiles and update their display names."
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        <DashboardStat label="Accounts" value={users.length} />
        <DashboardStat label="Clients" value={users.filter((user) => user.role === "client").length} />
        <DashboardStat label="Admins" value={users.filter((user) => user.role === "admin").length} />
      </div>

      {actionError && <p className="mt-6 text-sm text-red-700" role="alert">{actionError}</p>}

      <div className="mt-8 max-w-xl">
        <label className="block">
          <span className="label-editorial text-soft-black">Search by name or email</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className={dashboardInputClass} />
        </label>
      </div>

      {loading && <p className="mt-8 text-sm text-soft-black-muted">Loading users…</p>}
      {error && <p className="mt-8 text-sm text-red-700" role="alert">{error}</p>}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="mt-8 border border-dashed border-taupe/40 p-10 text-center text-sm text-soft-black-muted">
          No users match your search.
        </div>
      )}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-8 overflow-x-auto border border-taupe/40 bg-ivory-dark">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-taupe/30">
              <tr className="label-editorial text-[0.625rem] text-muted">
                <th className="px-5 py-4 font-normal">Account</th>
                <th className="px-5 py-4 font-normal">Email</th>
                <th className="px-5 py-4 font-normal">Role</th>
                <th className="px-5 py-4 font-normal">Created</th>
                <th className="px-5 py-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe/25">
              {filteredUsers.map((user) => (
                <tr key={user.uid}>
                  <td className="px-5 py-4 font-medium text-soft-black">{user.displayName || "—"}</td>
                  <td className="px-5 py-4 text-soft-black-muted">{user.email || "—"}</td>
                  <td className="px-5 py-4 text-soft-black-muted">{user.role}</td>
                  <td className="px-5 py-4 text-soft-black-muted">{formatUserDate(user.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(user)} className="label-editorial border border-soft-black/20 px-3 py-2 text-[0.625rem] text-soft-black hover:bg-soft-black hover:text-ivory">Edit name</button>
                      <button type="button" onClick={() => removeUser(user)} disabled={user.uid === currentUserId} className="label-editorial border border-red-200 px-3 py-2 text-[0.625rem] text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">Remove profile</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-soft-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
          <form onSubmit={saveEdit} className="w-full max-w-lg border border-taupe/40 bg-ivory p-6 shadow-xl md:p-8">
            <p className="label-editorial">Edit User</p>
            <h2 id="edit-user-title" className="font-display mt-2 text-2xl text-soft-black">{editing.email}</h2>
            <label className="mt-6 block">
              <span className="label-editorial text-soft-black">Display name</span>
              <input maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={dashboardInputClass} />
            </label>
            <p className="mt-3 text-xs leading-relaxed text-soft-black-muted">Email addresses and Firebase Authentication accounts cannot be changed or deleted from this static-hosted dashboard.</p>
            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving} className="label-editorial border border-soft-black bg-soft-black px-5 py-3 text-ivory disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => setEditing(null)} className="label-editorial border border-taupe/40 px-5 py-3 text-soft-black-muted">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
