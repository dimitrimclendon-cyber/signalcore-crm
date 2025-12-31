import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  User,
  Target,
  Mail,
  Phone,
  Building,
  MapPin,
  Save,
  LogOut,
  Check,
  Bell,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    email: "",
    company_name: "",
    contact_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notifications: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Get contractor profile
    const { data } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        email: user.email || "",
        company_name: data.company_name || "",
        contact_name: data.contact_name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        notifications: data.notifications ?? true,
      });
    } else {
      setProfile((prev) => ({ ...prev, email: user.email || "" }));
    }
    setLoading(false);
  }

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("contractors").upsert({
      id: user.id,
      company_name: profile.company_name,
      contact_name: profile.contact_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      notifications: profile.notifications,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function updateProfile(key: string, value: any) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Head>
        <title>Intelligence Profile | SignalCore</title>
      </Head>
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <a className="text-slate-400 hover:text-white transition">
                    <Target className="w-6 h-6 text-emerald-500" />
                  </a>
                </Link>
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  Account
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  {saved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved ? "Saved!" : "Save"}
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-600/50 text-white rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" />
                  Company Information
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profile.company_name}
                      onChange={(e) =>
                        updateProfile("company_name", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={profile.contact_name}
                      onChange={(e) =>
                        updateProfile("contact_name", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email (Login)
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Service Area
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => updateProfile("address", e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => updateProfile("city", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={profile.state}
                        onChange={(e) => updateProfile("state", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        ZIP
                      </label>
                      <input
                        type="text"
                        value={profile.zip}
                        onChange={(e) => updateProfile("zip", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notifications
                </h2>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Email Notifications
                    </p>
                    <p className="text-sm text-slate-500">
                      Get notified when new leads match your criteria
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notifications}
                      onChange={(e) =>
                        updateProfile("notifications", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
