import { useState } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  ArrowRight,
  Tag,
  Download,
  MoreHorizontal,
  X,
  Users,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BulkActionsProps {
  selectedIds: string[];
  onSelectionClear: () => void;
  onActionComplete: () => void;
  totalCount: number;
}

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "assigned", label: "Assigned" },
  { value: "sold", label: "Won" },
  { value: "dead", label: "Dead" },
];

export default function BulkActions({
  selectedIds,
  onSelectionClear,
  onActionComplete,
  totalCount,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  if (selectedIds.length === 0) return null;

  async function handleBulkStatusChange(newStatus: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .in("id", selectedIds);

      if (error) throw error;

      // Log activity
      for (const id of selectedIds) {
        await supabase.from("activities").insert([
          {
            lead_id: id,
            action: "status_change",
            details: `Bulk status change to ${newStatus}`,
          },
        ]);
      }

      onActionComplete();
      onSelectionClear();
    } catch (error) {
      console.error("Bulk status change failed:", error);
    } finally {
      setLoading(false);
      setShowStatusMenu(false);
    }
  }

  async function handleBulkDelete() {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} leads? This cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      onActionComplete();
      onSelectionClear();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportSelected() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .in("id", selectedIds);

      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Address",
        "City",
        "State",
        "Owner",
        "Phone",
        "Email",
        "SQFT",
        "Year Built",
        "POC Score",
        "Status",
      ];
      const rows = data.map((lead) => [
        lead.address,
        lead.city,
        lead.state,
        lead.owner_name,
        lead.owner_phone,
        lead.owner_email,
        lead.building_sqft,
        lead.year_built,
        lead.poc_score,
        lead.status,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );

      // Download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl shadow-black/50 p-4 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium">
            {selectedIds.length} of {totalCount} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Change Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              Change Status
            </button>

            {showStatusMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBulkStatusChange(option.value)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 transition"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExportSelected}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Delete */}
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Clear Selection */}
        <button
          onClick={onSelectionClear}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
