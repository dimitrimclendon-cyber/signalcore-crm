import { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Save,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";

interface FilterState {
  search: string;
  status: string[];
  minScore: number;
  maxScore: number;
  minSqft: number;
  maxSqft: number;
  cities: string[];
  hasOwnerPhone: boolean;
  hasOwnerEmail: boolean;
  sources: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
}

interface AdvancedSearchProps {
  onFilterChange: (filters: FilterState) => void;
  availableCities?: string[];
  availableSources?: string[];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: [],
  minScore: 0,
  maxScore: 100,
  minSqft: 0,
  maxSqft: 0,
  cities: [],
  hasOwnerPhone: false,
  hasOwnerEmail: false,
  sources: [],
};

const STATUS_OPTIONS = [
  { value: "available", label: "Available", color: "bg-emerald-500" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500" },
  { value: "qualified", label: "Qualified", color: "bg-purple-500" },
  { value: "proposal", label: "Proposal", color: "bg-amber-500" },
  { value: "assigned", label: "Assigned", color: "bg-cyan-500" },
  { value: "sold", label: "Won", color: "bg-green-500" },
  { value: "dead", label: "Lost", color: "bg-red-500" },
];

export default function AdvancedSearch({
  onFilterChange,
  availableCities = [],
  availableSources = [],
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState("");

  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }

  function toggleArrayFilter<K extends keyof FilterState>(
    key: K,
    value: string
  ) {
    const current = filters[key] as string[];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, newValue as FilterState[K]);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  }

  function saveCurrentFilter() {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters },
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    setFilterName("");

    // Save to localStorage
    localStorage.setItem(
      "savedFilters",
      JSON.stringify([...savedFilters, newFilter])
    );
  }

  function loadFilter(saved: SavedFilter) {
    setFilters(saved.filters);
    onFilterChange(saved.filters);
  }

  function deleteFilter(id: string) {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("savedFilters", JSON.stringify(updated));
  }

  const activeFiltersCount = [
    filters.status.length > 0,
    filters.minScore > 0,
    filters.maxScore < 100,
    filters.minSqft > 0,
    filters.maxSqft > 0,
    filters.cities.length > 0,
    filters.hasOwnerPhone,
    filters.hasOwnerEmail,
    filters.sources.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by address, owner, city..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
              isExpanded || activeFiltersCount > 0
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter("status", option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    filters.status.includes(option.value)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${option.color}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Score Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Min POC Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) =>
                  updateFilter("minScore", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max POC Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) =>
                  updateFilter("maxScore", parseInt(e.target.value) || 100)
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SQFT Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Min SQFT
              </label>
              <input
                type="number"
                min="0"
                value={filters.minSqft}
                onChange={(e) =>
                  updateFilter("minSqft", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max SQFT
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxSqft}
                onChange={(e) =>
                  updateFilter("maxSqft", parseInt(e.target.value) || 0)
                }
                placeholder="No limit"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Filters */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Contact Requirements
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasOwnerPhone}
                  onChange={(e) =>
                    updateFilter("hasOwnerPhone", e.target.checked)
                  }
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Has Phone Number</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasOwnerEmail}
                  onChange={(e) =>
                    updateFilter("hasOwnerEmail", e.target.checked)
                  }
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Has Email</span>
              </label>
            </div>
          </div>

          {/* Save Filter */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={saveCurrentFilter}
              disabled={!filterName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              Save Filter
            </button>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Saved Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-700 rounded-lg group"
                  >
                    <button
                      onClick={() => loadFilter(saved)}
                      className="text-sm text-slate-300 hover:text-white"
                    >
                      {saved.name}
                    </button>
                    <button
                      onClick={() => deleteFilter(saved.id)}
                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to apply filters to leads array
export function applyFilters(leads: any[], filters: FilterState): any[] {
  return leads.filter((lead) => {
    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        lead.address?.toLowerCase().includes(searchLower) ||
        lead.owner_name?.toLowerCase().includes(searchLower) ||
        lead.city?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(lead.status)) {
      return false;
    }

    // Score range
    if (filters.minScore > 0 && (lead.poc_score || 0) < filters.minScore)
      return false;
    if (filters.maxScore < 100 && (lead.poc_score || 0) > filters.maxScore)
      return false;

    // SQFT range
    if (filters.minSqft > 0 && (lead.building_sqft || 0) < filters.minSqft)
      return false;
    if (filters.maxSqft > 0 && (lead.building_sqft || 0) > filters.maxSqft)
      return false;

    // Contact requirements
    if (filters.hasOwnerPhone && !lead.owner_phone) return false;
    if (filters.hasOwnerEmail && !lead.owner_email) return false;

    // City filter
    if (filters.cities.length > 0 && !filters.cities.includes(lead.city))
      return false;

    // Source filter
    if (
      filters.sources.length > 0 &&
      !filters.sources.some((s) => lead.source?.includes(s))
    )
      return false;

    return true;
  });
}
