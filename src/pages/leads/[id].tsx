import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  User,
  Building2,
  Smartphone,
  Mail,
  Calendar,
  Maximize2,
  Zap,
  ShieldAlert,
  TrendingUp,
  MessageSquare,
  Clock,
  History,
  FileText,
  Target,
} from "lucide-react";
import { supabase, Lead } from "@/lib/supabase";

export default function LeadDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  async function fetchLead() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
    } else {
      setLead(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="text-white text-xl animate-pulse">
          Scanning Intel Database...
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 text-white space-y-4">
        <h1 className="text-2xl font-bold">Signal Not Found</h1>
        <p className="text-slate-400">
          The lead you are looking for does not exist in our registries.
        </p>
        <Link href="/leads" legacyBehavior>
          <a className="px-6 py-2 bg-teal-500 text-navy-900 font-bold rounded-lg">
            Return to Inventory
          </a>
        </Link>
      </div>
    );
  }

  const rawData = lead.raw_data || {};
  const statusColors: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    assigned: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    sold: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <>
      <Head>
        <title>{lead.address} | Lead Intelligence</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link href="/leads" legacyBehavior>
              <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                Back to Inventory
              </a>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {lead.address}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    statusColors[lead.status] ||
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  } capitalize`}
                >
                  {lead.status}
                </span>
              </div>
              <p className="text-lg text-slate-400 flex items-center gap-2">
                <MapPin size={18} className="text-teal-400" />
                {lead.city}, {lead.state} {lead.zip}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
              <History size={18} />
              View History
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20">
              <ShieldAlert size={18} />
              Assign Priority
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Hardware & Intel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 text-teal-400">
                  <Building2 size={24} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">
                    Building Specs
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Square Footage
                    </p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Maximize2 size={14} className="text-slate-500" />
                      {lead.building_sqft?.toLocaleString() || "---"} SF
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Year Built
                    </p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      {lead.year_built || "---"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Building Class
                    </p>
                    <p className="text-white font-medium uppercase">
                      {rawData.building_class || "B"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Property Type
                    </p>
                    <p className="text-white font-medium">Commercial</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                  <Zap size={24} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">
                    HVAC Opportunity
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Equipment Age
                    </p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      {rawData.equipment_age_years || "Unknown"} Years
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Urgency Score
                    </p>
                    <p
                      className={`font-bold flex items-center gap-2 ${
                        lead.poc_score > 70
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      <TrendingUp size={14} />
                      {lead.poc_score} / 100
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Status
                    </p>
                    <p
                      className={`font-medium uppercase ${
                        rawData.equipment_urgency === "CRITICAL"
                          ? "text-red-400"
                          : "text-slate-300"
                      }`}
                    >
                      {rawData.equipment_status || "MATURE"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Budget Est.
                    </p>
                    <p className="text-white font-medium text-emerald-400">
                      {rawData.budget_range || "Contact agent"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Talking Points */}
            <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-navy-800 to-navy-900 border-l-4 border-l-teal-500">
              <div className="flex items-center gap-3 text-white">
                <MessageSquare size={24} className="text-teal-400" />
                <h3 className="text-xl font-bold">Suggested Sales Strategy</h3>
              </div>
              <div className="space-y-4">
                {rawData.sales_talking_points ? (
                  rawData.sales_talking_points
                    .split(";")
                    .map((point: string, i: number) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
                      >
                        <div className="mt-1 w-2 h-2 bg-teal-400 rounded-full shrink-0" />
                        <p className="text-slate-300 text-lg leading-relaxed">
                          {point.trim()}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-slate-500 italic">
                    No specific signals detected. Use standard cold call
                    protocol for commercial property management.
                  </p>
                )}
              </div>
            </div>

            {/* Raw Intelligence Blob (Collapsible/Scrollable) */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <FileText size={20} />
                <h3 className="font-bold uppercase tracking-wider text-xs">
                  Technical Signal Data
                </h3>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs overflow-x-auto text-slate-400 leading-relaxed">
                <pre>{JSON.stringify(rawData, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3 text-indigo-400">
                <User size={24} />
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  Ownership Details
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    Property Owner
                  </p>
                  <p className="text-white font-bold text-lg">
                    {lead.owner_name || "Individual Owner"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Mobile Signal
                      </p>
                      <p className="text-white font-medium">
                        {lead.owner_phone || "(509) XXX-XXXX"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Email Registry
                      </p>
                      <p className="text-white font-medium truncate max-w-[180px]">
                        {lead.owner_email || "Not in cache"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    Lead Source
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-indigo-300">
                    <Target size={14} />
                    {lead.source || "Scraper Engine"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 border-2 border-indigo-500/20">
              <h3 className="font-bold text-white mb-4">
                On-Site Verification
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Request a manual verification of this property's HVAC units by a
                field agent.
              </p>
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                Dispatch Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
