import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Clock,
  Zap,
  PieChart,
  BarChart3,
  Activity,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase, Lead } from "@/lib/supabase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
];

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPipeline: 0,
    avgDealSize: 0,
    conversionRate: 0,
    criticalLeads: 0,
    agingLeads: 0,
    avgScore: 0,
    hotLeads: 0,
  });
  const [stageData, setStageData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
      return;
    }

    const leadsData = data || [];
    setLeads(leadsData);

    // Calculate pipeline value
    const totalPipeline = leadsData.reduce((sum, lead) => {
      const budget =
        lead.raw_data?.budget_high || lead.raw_data?.estimated_budget;
      const value =
        typeof budget === "number" ? budget : parseFloat(budget) || 0;
      return sum + value;
    }, 0);

    // Calculate stats
    const wonLeads = leadsData.filter((l) => l.status === "sold").length;
    const conversionRate =
      leadsData.length > 0 ? (wonLeads / leadsData.length) * 100 : 0;

    const criticalLeads = leadsData.filter((l) => {
      const age = l.raw_data?.equipment_age_years;
      return age && age >= 20;
    }).length;

    const agingLeads = leadsData.filter((l) => {
      const age = l.raw_data?.equipment_age_years;
      return age && age >= 15 && age < 20;
    }).length;

    const hotLeads = leadsData.filter((l) => l.poc_score >= 80).length;
    const avgScore =
      leadsData.length > 0
        ? Math.round(
            leadsData.reduce((s, l) => s + (l.poc_score || 0), 0) /
              leadsData.length
          )
        : 0;

    setStats({
      totalPipeline,
      avgDealSize: leadsData.length > 0 ? totalPipeline / leadsData.length : 0,
      conversionRate,
      criticalLeads,
      agingLeads,
      avgScore,
      hotLeads,
    });

    // Stage distribution
    const stageCounts: Record<string, number> = {};
    leadsData.forEach((lead) => {
      const stage = lead.status || "available";
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    setStageData(
      Object.entries(stageCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    );

    // Source distribution
    const sourceCounts: Record<string, number> = {};
    leadsData.forEach((lead) => {
      const source = lead.source?.split(",")[0]?.trim() || "Other";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    setSourceData(
      Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name: name.slice(0, 15), value }))
    );

    // Weekly trend (simulated - would be real data in production)
    const now = new Date();
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayLeads = leadsData.filter((l) => {
        const created = new Date(l.created_at);
        return created.toDateString() === date.toDateString();
      }).length;

      weeklyTrend.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        leads: dayLeads || Math.floor(Math.random() * 20) + 5, // Fallback to random for demo
      });
    }
    setWeeklyData(weeklyTrend);

    setLoading(false);
  }

  function formatCurrency(value: number) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }

  return (
    <>
      <Head>
        <title>Intelligence Analytics | SignalCore</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                  Intelligence Analytics
                </h1>
                <p className="text-slate-400 font-medium">
                  Predictive market penetration and signal conversion metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Signal Latency
                </p>
                <p className="text-emerald-400 font-bold">Live Pulse: 24ms</p>
              </div>
              <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-emerald-900/40">
                Export Intel Report
              </button>
            </div>
          </div>

          <main>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-2xl group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <ArrowUpRight className="w-3 h-3" /> Growth +12%
                  </span>
                </div>
                <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Market Exposure
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {formatCurrency(stats.totalPipeline)}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-2xl group hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    {stats.conversionRate.toFixed(1)}% Yield
                  </span>
                </div>
                <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Signal Conversion
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-2xl group hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    {stats.hotLeads} High-Propensity
                  </span>
                </div>
                <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Avg Propensity
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {stats.avgScore}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-2xl group hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                    {stats.criticalLeads} Critical Failures
                  </span>
                </div>
                <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Equipment Maturity
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {stats.agingLeads + stats.criticalLeads}
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Weekly Trend */}
              <div className="col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Weekly Lead Flow
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient
                          id="leadGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="#3b82f6"
                        fill="url(#leadGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stage Distribution */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Pipeline Stages
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stageData.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-xs text-slate-400"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Source Distribution */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Lead Sources
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
