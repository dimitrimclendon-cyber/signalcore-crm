'use client'

import { useState } from 'react'
import { Search, Filter, Download, MapPin, User, Building2 } from 'lucide-react'

const initialLeads = [
  { id: '1', address: '3905 S Dishman Mica Rd', city: 'Spokane Valley', owner: 'ITRON, INC.', sqft: 125000, yearBuilt: 1995, pocScore: 9, status: 'available' },
  { id: '2', address: '1505 N Argonne Rd', city: 'Spokane', owner: 'HIGHLINE GRAIN, LLC', sqft: 85000, yearBuilt: 1988, pocScore: 8, status: 'available' },
  { id: '3', address: '2515 E Sprague Ave', city: 'Spokane', owner: 'RIVERSIDE PROPERTIES', sqft: 45000, yearBuilt: 2001, pocScore: 8, status: 'assigned' },
  { id: '4', address: '505 W Riverside Ave', city: 'Spokane', owner: 'DOWNTOWN INVESTORS LLC', sqft: 200000, yearBuilt: 1985, pocScore: 9, status: 'available' },
  { id: '5', address: '1515 N Sullivan Rd', city: 'Spokane Valley', owner: 'VALLEY MALL PARTNERS', sqft: 350000, yearBuilt: 1992, pocScore: 9, status: 'sold' },
  { id: '6', address: '707 W Main Ave', city: 'Spokane', owner: 'MAIN STREET HOLDINGS', sqft: 75000, yearBuilt: 1978, pocScore: 8, status: 'available' },
]

const statusColors: Record<string, string> = {
  available: 'text-emerald-400',
  assigned: 'text-amber-400',
  sold: 'text-blue-400',
}

export default function LeadsPage() {
  const [leads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = leads.filter(lead => {
    const matchesSearch = lead.address.toLowerCase().includes(search.toLowerCase()) ||
                         lead.owner.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lead Inventory</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads • {leads.filter(l => l.status === 'available').length} available</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white border border-white/10 rounded-lg transition-colors">
            <Download size={18} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors">
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by address or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-navy-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-navy-800 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-teal-500/50"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Property</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Owner</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Size</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Built</th>
              <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">POC</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                      <Building2 size={18} className="text-teal-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{lead.address}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={12} />
                        {lead.city}, WA
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <User size={14} className="text-slate-400" />
                    {lead.owner}
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">
                  {lead.sqft.toLocaleString()} SF
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">
                  {lead.yearBuilt}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-500/20 text-teal-400 rounded-full text-sm font-bold">
                    {lead.pocScore}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-sm capitalize ${statusColors[lead.status]}`}>
                    ● {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
