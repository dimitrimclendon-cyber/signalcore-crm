import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Settings,
  Target,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Key,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";

interface SettingSection {
  id: string;
  name: string;
  icon: any;
}

const SECTIONS: SettingSection[] = [
  { id: "general", name: "General", icon: Settings },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "email", name: "Email Templates", icon: Mail },
  { id: "security", name: "Security", icon: Shield },
  { id: "api", name: "API Keys", icon: Key },
  { id: "data", name: "Data Management", icon: Database },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "SignalCore",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    leadExpiry: 30,
    emailNotifications: true,
    pushNotifications: false,
    dealAlerts: true,
    weeklyDigest: true,
    twoFactorAuth: false,
    sessionTimeout: 60,
    apiKey: "sk_live_***********************",
  });

  function handleSave() {
    // Save to localStorage/API
    localStorage.setItem("crmSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateSetting(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Head>
        <title>Settings | SignalCore CRM</title>
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
                  <Settings className="w-5 h-5 text-slate-400" />
                  Settings
                </h1>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                {saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeSection === section.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeSection === "general" && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    General Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) =>
                          updateSetting("companyName", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) =>
                          updateSetting("timezone", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="America/Los_Angeles">
                          Pacific Time (PST)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MST)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CST)
                        </option>
                        <option value="America/New_York">
                          Eastern Time (EST)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Lead Expiry (days)
                      </label>
                      <input
                        type="number"
                        value={settings.leadExpiry}
                        onChange={(e) =>
                          updateSetting("leadExpiry", parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Leads will be marked as stale after this many days
                        without activity
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                      },
                      {
                        key: "pushNotifications",
                        label: "Push Notifications",
                        desc: "Browser push notifications",
                      },
                      {
                        key: "dealAlerts",
                        label: "Deal Alerts",
                        desc: "Get notified when deals close",
                      },
                      {
                        key: "weeklyDigest",
                        label: "Weekly Digest",
                        desc: "Receive weekly performance summary",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-slate-700/50"
                      >
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(settings as any)[item.key]}
                            onChange={(e) =>
                              updateSetting(item.key, e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                      <div>
                        <p className="text-white font-medium">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-slate-500">
                          Add an extra layer of security
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) =>
                            updateSetting("twoFactorAuth", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-400 font-medium">
                            Security Recommendation
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            Enable two-factor authentication for enhanced
                            account security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "api" && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    API Configuration
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        API Key
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="password"
                          value={settings.apiKey}
                          readOnly
                          className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                        />
                        <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
                          Regenerate
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Use this key to access the SignalCore API
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h3 className="text-white font-medium mb-2">
                        API Documentation
                      </h3>
                      <p className="text-sm text-slate-400 mb-3">
                        Access our API docs to integrate with external systems.
                      </p>
                      <a
                        href="/docs/api"
                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                      >
                        View Documentation →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {(activeSection === "email" || activeSection === "data") && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    {activeSection === "email"
                      ? "Email Templates"
                      : "Data Management"}
                  </h2>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
