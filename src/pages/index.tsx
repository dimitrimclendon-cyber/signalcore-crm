import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Target,
  ChevronRight,
  MapPin,
  Building2,
  Zap,
  Crown,
  ArrowRight,
} from "lucide-react";
import { supabase, Lead } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    myLeadsCount: 0,
    leadsUsedThisMonth: 0,
    leadsRemaining: 30,
    newLeadsToday: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch my purchased leads
    if (user) {
      const { data: purchased } = await supabase
        .from("leads")
        .select("*")
        .or(`assigned_to.eq.${user.id},contracted_by.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      setMyLeads(purchased || []);
      setStats((prev) => ({
        ...prev,
        myLeadsCount: purchased?.length || 0,
        leadsUsedThisMonth: purchased?.length || 0,
      }));
    }

    // Fetch hot available leads (high POC score)
    const { data: available } = await supabase
      .from("leads")
      .select("*")
      .eq("status", "available")
      .gte("poc_score", 70)
      .order("poc_score", { ascending: false })
      .limit(5);

    setHotLeads(available || []);
    setStats((prev) => ({ ...prev, newLeadsToday: available?.length || 0 }));

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>IntelliLead Dashboard | SignalCore</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Target className="w-8 h-8 text-emerald-400" />
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Signal<span className="text-emerald-400">Core</span>
                  </h1>
                </div>
                <p className="text-slate-400 font-medium">
                  Predictive Intelligence Platform
                </p>
              </div>

              <Link href="/leads" legacyBehavior>
                <a className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition shadow-lg shadow-emerald-600/20">
                  <ShoppingCart className="w-5 h-5" />
                  Intelligence Hub
                </a>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Active Signals
                </span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                {stats.myLeadsCount}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Signals Processed
                </span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                {stats.leadsUsedThisMonth}
                <span className="text-lg text-slate-500 font-normal">
                  /{stats.leadsRemaining}
                </span>
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Tier Status
                </span>
              </div>
              <p className="text-xl font-bold text-white">Enterprise Elite</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl border border-emerald-500/30 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/30 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-emerald-400 font-bold uppercase tracking-wider">
                  High-Propensity
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-400 tracking-tight">
                {stats.newLeadsToday}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* High-Propensity Signals */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-xl">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Predictive Opportunity Signals
                </h2>
                <Link href="/leads" legacyBehavior>
                  <a className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition">
                    Expand Coverage <ChevronRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>

              <div className="divide-y divide-slate-700/30">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">
                    Loading...
                  </div>
                ) : hotLeads.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No hot leads available right now
                  </div>
                ) : (
                  hotLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="px-6 py-4 hover:bg-slate-700/20 cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white group-hover:text-emerald-400 transition">
                            {lead.address}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {lead.building_sqft?.toLocaleString()} SF
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              lead.poc_score >= 80
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {lead.poc_score} POC
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Intelligence Signals */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Recent Intelligence Signals
                </h2>
                <Link href="/my-leads" legacyBehavior>
                  <a className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
              <p className="text-sm text-slate-400 px-6 pt-2 pb-4">
                Signals prioritized by propensity score
              </p>

              <div className="divide-y divide-slate-700/30">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">
                    Loading...
                  </div>
                ) : myLeads.length === 0 ? (
                  <div className="p-6 text-center">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-3">
                      No intelligence signals captured yet
                    </p>
                    <Link href="/leads" legacyBehavior>
                      <a className="text-emerald-400 hover:text-emerald-300 text-sm">
                        Search Intelligence Hub →
                      </a>
                    </Link>
                  </div>
                ) : (
                  myLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="px-6 py-4 hover:bg-slate-700/20 cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white group-hover:text-blue-400 transition">
                            {lead.address}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.city}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                lead.status === "assigned"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : lead.status === "contacted"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }`}
                            >
                              {lead.status === "assigned" ? "New" : lead.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl border border-emerald-500/30 p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Ready to grow your HVAC business?
            </h2>
            <p className="text-slate-400 mb-6">
              Get exclusive access to high-intent commercial leads in your area
            </p>
            <Link href="/leads" legacyBehavior>
              <a className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition">
                Browse Available Leads
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
