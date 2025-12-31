import { supabase } from "./supabase";

// Role definitions
export type UserRole = "admin" | "manager" | "sales_rep";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

// Role permissions matrix
export const ROLE_PERMISSIONS = {
  admin: {
    canViewAllLeads: true,
    canAssignLeads: true,
    canDeleteLeads: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
    canAccessSettings: true,
    canViewContractors: true,
    canManageDeals: true,
  },
  manager: {
    canViewAllLeads: true,
    canAssignLeads: true,
    canDeleteLeads: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canExportData: true,
    canAccessSettings: false,
    canViewContractors: true,
    canManageDeals: true,
  },
  sales_rep: {
    canViewAllLeads: false, // Only assigned leads
    canAssignLeads: false,
    canDeleteLeads: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessSettings: false,
    canViewContractors: false,
    canManageDeals: false,
  },
};

// Check if user has specific permission
export function hasPermission(
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

// Get current user profile with role
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Try to get profile from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: user.email || "",
        role: profile.role || "sales_rep",
        full_name: profile.full_name || user.email?.split("@")[0] || "User",
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
      };
    }

    // If no profile exists, create one with default role
    const newProfile: UserProfile = {
      id: user.id,
      email: user.email || "",
      role: "admin" as UserRole, // First user is admin
      full_name: user.email?.split("@")[0] || "User",
      created_at: new Date().toISOString(),
    };

    await supabase.from("profiles").insert([newProfile]);

    return newProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    return !error;
  } catch (error) {
    console.error("Error updating user role:", error);
    return false;
  }
}

// Get all users (admin/manager only)
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    return data || [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  sales_rep: "Sales Representative",
};

// Role badge colors
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sales_rep: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};
