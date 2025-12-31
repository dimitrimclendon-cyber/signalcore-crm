import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Package,
  MapPin,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  Clock,
  CheckCircle,
  Target,
  Zap,
  TrendingUp,
  Crown,
} from "lucide-react";
import { supabase, Lead } from "@/lib/supabase";

export default function MyLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, new, contacted, converted

  useEffect(() => {
    fetchMyLeads();
  }, []);

  async function fetchMyLeads() {
    setLoading(true);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch leads assigned to this user/contractor
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .or(`assigned_to.eq.${user.id},contracted_by.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  function getFilteredLeads() {
    if (filter === "all") return leads;
    if (filter === "new") return leads.filter((l) => l.status === "assigned");
    if (filter === "contacted")
      return leads.filter((l) => l.status === "contacted");
    if (filter === "converted") return leads.filter((l) => l.status === "sold");
    return leads;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const filteredLeads = getFilteredLeads();

  return (
    <>
      <Head>
        <title>Active Signals | SignalCore IntelliLead</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" legacyBehavior>
                <a className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                  <Target className="w-6 h-6 text-emerald-400" />
                  Signal<span className="text-emerald-400">Core</span>
                </a>
              </Link>
              <span className="text-slate-500">|</span>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Active Signals
              </h1>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition font-bold shadow-lg">
              <Download className="w-4 h-4" />
              Export Intel
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package className="w-12 h-12 text-white" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                Total Intelligence
              </p>
              <p className="text-3xl font-black text-white">{leads.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-12 h-12 text-emerald-400" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                Propensity Deployment
              </p>
              <p className="text-3xl font-black text-emerald-400">
                {leads.filter((l) => l.status === "assigned").length}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-12 h-12 text-blue-400" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                Market Engagement
              </p>
              <p className="text-3xl font-black text-blue-400">
                {
                  leads.filter(
                    (l) => l.status === "contacted" || l.status === "qualified"
                  ).length
                }
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Crown className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                Signal Conversion
              </p>
              <p className="text-3xl font-black text-purple-400">
                {leads.filter((l) => l.status === "sold").length}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-8 bg-slate-800/30 p-1 rounded-xl border border-slate-700/50 w-fit">
            {[
              { id: "all", label: "All Signals" },
              { id: "new", label: "Fresh Deployment" },
              { id: "contacted", label: "In-Progress Intel" },
              { id: "converted", label: "Converted Value" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  filter === tab.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Signals List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Synchronizing Active Signals...
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-24 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
                  {filter === "all"
                    ? "Zero Active Signals"
                    : `No signals in ${filter} state`}
                </h3>
                <p className="text-slate-500 mb-8 font-medium">
                  Initialize market intelligence via the Intelligence Hub
                </p>
                <Link href="/leads" legacyBehavior>
                  <a className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/40 hover:scale-105">
                    Search Intelligence Hub
                  </a>
                </Link>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="bg-slate-800/40 hover:bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6 cursor-pointer transition-all group flex items-center justify-between shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/30"
                >
                  <div className="flex items-center gap-6">
                    {/* Score badge in card */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-slate-900/80 border ${
                        lead.poc_score >= 80
                          ? "border-emerald-500/40"
                          : "border-slate-700"
                      }`}
                    >
                      <span
                        className={`text-lg font-black ${
                          lead.poc_score >= 80
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {lead.poc_score}
                      </span>
                      <span className="text-[7px] font-black uppercase text-slate-600 -mt-1 leading-none">
                        INTEL
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                          {lead.address}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            lead.status === "assigned"
                              ? "bg-emerald-500 text-white"
                              : lead.status === "contacted" ||
                                lead.status === "qualified"
                              ? "bg-blue-600 text-white"
                              : lead.status === "sold"
                              ? "bg-purple-600 text-white"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {lead.status === "assigned"
                            ? "Deployment"
                            : lead.status === "contacted"
                            ? "Engagement"
                            : lead.status === "qualified"
                            ? "Qualified"
                            : lead.status === "sold"
                            ? "Converted"
                            : lead.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-tight">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {lead.city}, {lead.state}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {lead.building_sqft?.toLocaleString()} SF
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Deployed {formatDate(lead.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-600 uppercase mb-1">
                        Captured Intelligence
                      </span>
                      <div className="flex items-center gap-3">
                        {lead.owner_phone && (
                          <div
                            className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 shadow-sm"
                            title="Phone Intelligence Active"
                          >
                            <Phone className="w-4 h-4" />
                          </div>
                        )}
                        {lead.owner_email && (
                          <div
                            className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-blue-400 shadow-sm"
                            title="Email Intelligence Active"
                          >
                            <Mail className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-700/30 text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
