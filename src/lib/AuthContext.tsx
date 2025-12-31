import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import {
  UserProfile,
  UserRole,
  getCurrentUserProfile,
  hasPermission,
  ROLE_PERMISSIONS,
} from "./rbac";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.admin) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSalesRep: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        await checkUser();
      }
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function checkPermission(
    permission: keyof typeof ROLE_PERMISSIONS.admin
  ): boolean {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission: checkPermission,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isSalesRep: user?.role === "sales_rep",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protecting routes based on permissions
export function withPermission(
  WrappedComponent: React.ComponentType,
  requiredPermission: keyof typeof ROLE_PERMISSIONS.admin
) {
  return function ProtectedComponent(props: any) {
    const { user, loading, hasPermission } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    if (!hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-slate-400">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
