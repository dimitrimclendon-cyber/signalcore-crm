'use client'

import { useState } from 'react'
import { Plus, Search, Phone, Mail, Building } from 'lucide-react'

const initialContractors = [
  { id: '1', company: 'Inland Mechanical', contact: 'Mike Johnson', email: 'mike@inlandmech.com', phone: '(509) 555-1234', tier: 'priority', status: 'active', monthlyFee: 2500 },
  { id: '2', company: 'Spokane HVAC Pro', contact: 'Sarah Williams', email: 'sarah@spokanehvac.com', phone: '(509) 555-5678', tier: 'executive', status: 'active', monthlyFee: 5000 },
  { id: '3', company: 'Valley Climate', contact: 'Tom Brown', email: 'tom@valleyclimate.com', phone: '(509) 555-9012', tier: 'feed', status: 'active', monthlyFee: 750 },
  { id: '4', company: 'Northwest Comfort', contact: 'Lisa Chen', email: 'lisa@nwcomfort.com', phone: '(509) 555-3456', tier: 'priority', status: 'prospect', monthlyFee: 0 },
]

const tierBadges: Record<string, string> = {
  feed: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  priority: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  executive: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

const tierNames: Record<string, string> = {
  feed: 'The Feed',
  priority: 'Priority Intel',
  executive: 'Executive Partner',
}

export default function ContractorsPage() {
  const [contractors] = useState(initialContractors)
  const [search, setSearch] = useState('')

  const filtered = contractors.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contractors</h1>
          <p className="text-slate-400 mt-1">Manage your HVAC contractor clients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors">
          <Plus size={20} />
          Add Contractor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search contractors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-navy-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/50"
        />
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((contractor) => (
          <div key={contractor.id} className="glass-card p-6 hover:border-teal-500/30 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                  <Building className="text-teal-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{contractor.company}</h3>
                  <p className="text-sm text-slate-400">{contractor.contact}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${tierBadges[contractor.tier]}`}>
                {tierNames[contractor.tier]}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail size={14} className="text-slate-400" />
                {contractor.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone size={14} className="text-slate-400" />
                {contractor.phone}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className={`text-sm ${contractor.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                ● {contractor.status === 'active' ? 'Active' : 'Prospect'}
              </span>
              {contractor.monthlyFee > 0 && (
                <span className="text-sm text-slate-400">
                  ${contractor.monthlyFee.toLocaleString()}/mo
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
