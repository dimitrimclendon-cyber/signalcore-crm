import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Filter,
  Download,
  MapPin,
  User,
  Building2,
  X,
  Check,
  ChevronRight,
  Package,
  Zap,
  Target,
  Calendar,
  Layers,
} from "lucide-react";
import Head from "next/head";
import { supabase, Lead, Contractor } from "@/lib/supabase";

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchContractors();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("poc_score", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  async function fetchContractors() {
    const { data } = await supabase
      .from("contractors")
      .select("*")
      .eq("status", "active");
    setContractors(data || []);
  }

  async function handleAssignLead(contractorId: string) {
    if (!selectedLead) return;
    setAssigning(true);

    try {
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          status: "assigned",
          assigned_to: contractorId,
        })
        .eq("id", selectedLead.id);

      if (leadError) throw leadError;

      const contractor = contractors.find((c) => c.id === contractorId);
      await supabase.from("activities").insert([
        {
          contractor_id: contractorId,
          lead_id: selectedLead.id,
          action: "Lead Assigned",
          details: `Assigned signal at ${selectedLead.address} to ${contractor?.company_name}`,
        },
      ]);

      setLeads(
        leads.map((l) =>
          l.id === selectedLead.id
            ? { ...l, status: "assigned", assigned_to: contractorId }
            : l
        )
      );
      setSelectedLead(null);
    } catch (error: any) {
      alert("Error assigning signal: " + error.message);
    } finally {
      setAssigning(false);
    }
  }

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      (lead.address?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (lead.owner_name?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Intelligence Hub | SignalCore</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Intelligence Hub
                </h1>
              </div>
              <p className="text-slate-400 font-medium">
                Predictive HVAC Market Signals & Replacement Propensity Analysis
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/10 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition font-bold shadow-xl">
                <Download className="w-4 h-4" />
                Export Signals
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Probe market signals by address or property owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white focus:border-emerald-500 focus:outline-none transition shadow-inner font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white focus:border-emerald-500 focus:outline-none transition appearance-none cursor-pointer font-medium"
              >
                <option value="all">Total Market Coverage</option>
                <option value="available">High-Propensity (Available)</option>
                <option value="assigned">Active Intelligence</option>
                <option value="sold">Converted Value</option>
              </select>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold uppercase"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                Signal Sync Active
              </span>
            </div>
          </div>

          {/* Signal Feed */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  Calibrating Market Signals...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <Layers className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-xl">
                  No matching signals in current scope
                </p>
                <p className="text-slate-500 mt-2">
                  Try broadening your search parameters
                </p>
              </div>
            ) : (
              filtered.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="bg-slate-800/40 hover:bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6 cursor-pointer transition-all group flex items-center justify-between shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/30"
                >
                  <div className="flex items-center gap-6">
                    {/* Score Indicator */}
                    <div className="relative flex flex-col items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center bg-slate-900/50 ${
                          lead.poc_score >= 80
                            ? "border-emerald-500 shadow-emerald-500/20"
                            : lead.poc_score >= 60
                            ? "border-amber-500"
                            : "border-slate-600"
                        }`}
                      >
                        <span
                          className={`text-xl font-black ${
                            lead.poc_score >= 80
                              ? "text-emerald-400"
                              : lead.poc_score >= 60
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        >
                          {lead.poc_score}
                        </span>
                        <span className="text-[8px] font-bold uppercase text-slate-500 -mt-1">
                          Propensity
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                          {lead.address}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-sm ${
                            lead.status === "available"
                              ? "bg-emerald-500 text-white"
                              : lead.status === "assigned"
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                          }`}
                        >
                          {lead.status === "available"
                            ? "Open Opportunity"
                            : lead.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-5 text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {lead.city}, {lead.state}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {lead.building_sqft?.toLocaleString() || "-"} SF
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Built {lead.year_built || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {lead.owner_name || "Confidential Owner"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {lead.status === "available" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95"
                      >
                        Acquire Signal
                      </button>
                    )}
                    <div className="p-2 rounded-lg bg-slate-700/30 text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acquisition Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <Zap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        Signal Acquisition
                      </h2>
                      <p className="text-slate-400 text-sm font-medium">
                        Confirm deployment of market intelligence
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 mb-8">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Subject Property
                  </p>
                  <p className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {selectedLead.address}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-400 font-medium">
                      {selectedLead.poc_score} Propensity Score
                    </span>
                    <span className="text-slate-700 text-sm">•</span>
                    <span className="text-sm text-slate-400 font-medium">
                      {selectedLead.city}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest pl-1">
                    Target Contractor Deployment
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {contractors.length === 0 ? (
                      <div className="p-8 text-center bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <p className="text-amber-400 font-bold">
                          Priority deployment targets unavailable
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Zero active contractors synchronized
                        </p>
                      </div>
                    ) : (
                      contractors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleAssignLead(c.id)}
                          disabled={assigning}
                          className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-emerald-500/10 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50">
                              {c.company_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-bold group-hover:text-white transition-colors">
                              {c.company_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-600 uppercase group-hover:text-emerald-500">
                              Deploy Signal
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex gap-4">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                  Abort Acquisition
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  );
}
