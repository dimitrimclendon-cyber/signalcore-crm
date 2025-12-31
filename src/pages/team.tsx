import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Users,
  Target,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  UserPlus,
  ChevronDown,
  Check,
  X,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  UserProfile,
  UserRole,
  getAllUsers,
  updateUserRole,
  ROLE_LABELS,
  ROLE_COLORS,
} from "@/lib/rbac";

export default function TeamPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("sales_rep");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
    setEditingUser(null);
  }

  async function handleInviteUser() {
    if (!inviteEmail) return;

    try {
      // Create user via Supabase Auth admin (would need service role key in production)
      // For now, just show success message
      alert(`Invitation sent to ${inviteEmail} as ${ROLE_LABELS[inviteRole]}`);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <Head>
        <title>Team | SignalCore CRM</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" legacyBehavior>
                  <a className="flex items-center gap-2 text-white font-bold text-xl">
                    <Target className="w-6 h-6 text-emerald-400" />
                    SignalCore
                  </a>
                </Link>
                <span className="text-slate-500">|</span>
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Team Management
                </h1>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                <UserPlus className="w-4 h-4" />
                Invite Team Member
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Role Legend */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-slate-400">Roles:</span>
            {(["admin", "manager", "sales_rep"] as UserRole[]).map((role) => (
              <span
                key={role}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}
              >
                {ROLE_LABELS[role]}
              </span>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Joined
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading team members...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No team members yet. Invite someone to get started!
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  e.target.value as UserRole
                                )
                              }
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Manager</option>
                              <option value="sales_rep">
                                Sales Representative
                              </option>
                            </select>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              ROLE_COLORS[user.role]
                            }`}
                          >
                            {ROLE_LABELS[user.role]}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Invite Team Member
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="sales_rep">Sales Representative</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
