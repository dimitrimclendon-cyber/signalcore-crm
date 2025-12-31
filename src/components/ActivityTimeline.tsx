import { useState, useEffect } from "react";
import {
  Clock,
  User,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Activity {
  id: string;
  lead_id: string | null;
  contractor_id: string | null;
  deal_id: string | null;
  action: string;
  details: string;
  created_at: string;
  user_name?: string;
}

interface ActivityTimelineProps {
  leadId?: string;
  contractorId?: string;
  limit?: number;
  showHeader?: boolean;
}

const ACTION_ICONS: Record<string, any> = {
  status_change: ArrowRight,
  viewed: Eye,
  updated: Edit,
  assigned: User,
  email_sent: Mail,
  call_made: Phone,
  note_added: MessageSquare,
  deal_created: FileText,
  deal_won: CheckCircle,
  deal_lost: XCircle,
  score_changed: TrendingUp,
  default: Clock,
};

const ACTION_COLORS: Record<string, string> = {
  status_change: "bg-blue-500/20 text-blue-400",
  viewed: "bg-slate-500/20 text-slate-400",
  updated: "bg-amber-500/20 text-amber-400",
  assigned: "bg-purple-500/20 text-purple-400",
  email_sent: "bg-cyan-500/20 text-cyan-400",
  call_made: "bg-green-500/20 text-green-400",
  note_added: "bg-pink-500/20 text-pink-400",
  deal_created: "bg-emerald-500/20 text-emerald-400",
  deal_won: "bg-green-500/20 text-green-400",
  deal_lost: "bg-red-500/20 text-red-400",
  score_changed: "bg-indigo-500/20 text-indigo-400",
  default: "bg-slate-500/20 text-slate-400",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityTimeline({
  leadId,
  contractorId,
  limit = 20,
  showHeader = true,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [leadId, contractorId]);

  async function fetchActivities() {
    setLoading(true);

    let query = supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    if (contractorId) {
      query = query.eq("contractor_id", contractorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500">
        <Clock className="w-5 h-5 animate-pulse mx-auto mb-2" />
        Loading activity...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
      {showHeader && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Activity Timeline
          </h3>
        </div>
      )}

      <div className="divide-y divide-slate-700/30">
        {activities.map((activity, index) => {
          const Icon = ACTION_ICONS[activity.action] || ACTION_ICONS.default;
          const colorClass =
            ACTION_COLORS[activity.action] || ACTION_COLORS.default;

          return (
            <div
              key={activity.id}
              className="px-4 py-3 hover:bg-slate-700/20 transition"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium capitalize">
                      {activity.action.replace(/_/g, " ")}
                    </span>
                  </p>
                  {activity.details && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {activity.details}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatTimeAgo(activity.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Utility function to log activities from anywhere
export async function logActivity(params: {
  leadId?: string;
  contractorId?: string;
  dealId?: string;
  action: string;
  details: string;
}) {
  try {
    await supabase.from("activities").insert([
      {
        lead_id: params.leadId || null,
        contractor_id: params.contractorId || null,
        deal_id: params.dealId || null,
        action: params.action,
        details: params.details,
      },
    ]);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
