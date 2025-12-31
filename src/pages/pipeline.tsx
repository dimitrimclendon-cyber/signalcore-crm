import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
  Building2,
  DollarSign,
  Clock,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { supabase, Lead } from "@/lib/supabase";

// Pipeline stages configuration
const PIPELINE_STAGES = [
  {
    id: "available",
    name: "New Leads",
    color: "bg-slate-600",
    textColor: "text-slate-300",
  },
  {
    id: "contacted",
    name: "Contacted",
    color: "bg-blue-600",
    textColor: "text-blue-300",
  },
  {
    id: "qualified",
    name: "Qualified",
    color: "bg-purple-600",
    textColor: "text-purple-300",
  },
  {
    id: "proposal",
    name: "Proposal",
    color: "bg-amber-600",
    textColor: "text-amber-300",
  },
  {
    id: "assigned",
    name: "Assigned",
    color: "bg-emerald-600",
    textColor: "text-emerald-300",
  },
  {
    id: "sold",
    name: "Won",
    color: "bg-green-600",
    textColor: "text-green-300",
  },
  {
    id: "dead",
    name: "Lost/Dead",
    color: "bg-red-900",
    textColor: "text-red-400",
  },
];

interface PipelineLead extends Lead {
  dragId?: string;
}

export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalLeads: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("poc_score", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      const leadsData = data || [];
      setLeads(leadsData);

      // Calculate stats
      const totalValue = leadsData.reduce((sum, lead) => {
        const budget =
          lead.raw_data?.budget_high || lead.raw_data?.estimated_budget || 0;
        return (
          sum + (typeof budget === "number" ? budget : parseFloat(budget) || 0)
        );
      }, 0);

      setStats({
        totalValue,
        totalLeads: leadsData.length,
        avgScore:
          leadsData.length > 0
            ? Math.round(
                leadsData.reduce((sum, l) => sum + (l.poc_score || 0), 0) /
                  leadsData.length
              )
            : 0,
      });
    }
    setLoading(false);
  }

  function getLeadsByStage(stageId: string) {
    // Map old statuses to new pipeline stages
    return leads.filter((lead) => {
      if (stageId === "available")
        return lead.status === "available" || !lead.status;
      if (stageId === "contacted") return lead.status === "contacted";
      if (stageId === "qualified") return lead.status === "qualified";
      if (stageId === "proposal") return lead.status === "proposal";
      if (stageId === "assigned") return lead.status === "assigned";
      if (stageId === "sold") return lead.status === "sold";
      if (stageId === "dead")
        return lead.status === "dead" || lead.status === "contracted";
      return false;
    });
  }

  function handleDragStart(e: React.DragEvent, lead: PipelineLead) {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent, targetStage: string) {
    e.preventDefault();
    if (!draggedLead || draggedLead.status === targetStage) {
      setDraggedLead(null);
      return;
    }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === draggedLead.id ? { ...l, status: targetStage as any } : l
      )
    );

    // Update in database
    const { error } = await supabase
      .from("leads")
      .update({ status: targetStage })
      .eq("id", draggedLead.id);

    if (error) {
      console.error("Error updating lead status:", error);
      fetchLeads(); // Rollback on error
    } else {
      // Log activity
      await supabase.from("activities").insert([
        {
          lead_id: draggedLead.id,
          action: "status_change",
          details: `Lead moved to ${targetStage}`,
        },
      ]);
    }

    setDraggedLead(null);
  }

  function formatCurrency(value: number) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }

  return (
    <>
      <Head>
        <title>Pipeline | SignalCore CRM</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" legacyBehavior>
                  <a className="flex items-center gap-2 text-white font-bold text-xl">
                    <Target className="w-6 h-6 text-emerald-400" />
                    SignalCore
                  </a>
                </Link>
                <span className="text-slate-500">|</span>
                <h1 className="text-lg font-semibold text-white">Pipeline</h1>
              </div>

              <nav className="flex items-center gap-6">
                <Link href="/" legacyBehavior>
                  <a className="text-slate-400 hover:text-white transition flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </a>
                </Link>
                <Link href="/leads" legacyBehavior>
                  <a className="text-slate-400 hover:text-white transition flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Leads
                  </a>
                </Link>
                <Link href="/contractors" legacyBehavior>
                  <a className="text-slate-400 hover:text-white transition flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contractors
                  </a>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Pipeline Value
                </p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Leads</p>
                <p className="text-lg font-bold text-white">
                  {stats.totalLeads}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Avg POC Score
                </p>
                <p className="text-lg font-bold text-white">{stats.avgScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const stageValue = stageLeads.reduce((sum, lead) => {
                const budget = lead.raw_data?.budget_high || 0;
                return (
                  sum +
                  (typeof budget === "number"
                    ? budget
                    : parseFloat(budget) || 0)
                );
              }, 0);

              return (
                <div
                  key={stage.id}
                  className="w-72 flex-shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className={`${stage.color} rounded-t-lg px-4 py-3`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{stage.name}</h3>
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-xs text-white/70 mt-1">
                        {formatCurrency(stageValue)}
                      </p>
                    )}
                  </div>

                  {/* Column Body */}
                  <div className="bg-slate-800/50 rounded-b-lg p-2 min-h-[500px] space-y-2">
                    {loading ? (
                      <div className="text-center py-8 text-slate-500">
                        Loading...
                      </div>
                    ) : stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Drop leads here
                      </div>
                    ) : (
                      stageLeads.slice(0, 15).map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          className="bg-slate-700/80 hover:bg-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition group border border-slate-600/50 hover:border-slate-500"
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {lead.address}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {lead.city}, {lead.state}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    lead.poc_score >= 80
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : lead.poc_score >= 60
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-slate-500/20 text-slate-400"
                                  }`}
                                >
                                  {lead.poc_score} POC
                                </span>
                                {lead.building_sqft && (
                                  <span className="text-xs text-slate-500">
                                    {(lead.building_sqft / 1000).toFixed(0)}K SF
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        </div>
                      ))
                    )}
                    {stageLeads.length > 15 && (
                      <div className="text-center py-2 text-slate-500 text-xs">
                        +{stageLeads.length - 15} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
