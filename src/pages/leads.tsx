import { useState, useEffect } from 'react'
import { Search, Filter, Download, MapPin, User, Building2, X, Check } from 'lucide-react'
import Head from 'next/head'
import { supabase, Lead, Contractor } from '@/lib/supabase'

const statusColors: Record<string, string> = {
  available: 'text-emerald-400',
  assigned: 'text-amber-400',
  sold: 'text-blue-400',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchLeads()
    fetchContractors()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('poc_score', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  async function fetchContractors() {
    const { data } = await supabase.from('contractors').select('id, company_name').eq('status', 'active')
    setContractors(data || [])
  }

  async function handleAssignLead(contractorId: string) {
    if (!selectedLead) return
    setAssigning(true)

    try {
      // 1. Update lead status and assigned_to
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          status: 'assigned', 
          assigned_to: contractorId 
        })
        .eq('id', selectedLead.id)

      if (leadError) throw leadError

      // 2. Log activity
      const contractor = contractors.find(c => c.id === contractorId)
      await supabase.from('activities').insert([{
        contractor_id: contractorId,
        lead_id: selectedLead.id,
        action: 'Lead Assigned',
        details: `Assigned ${selectedLead.address} to ${contractor?.company_name}`
      }])

      // 3. Update local state
      setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: 'assigned', assigned_to: contractorId } : l))
      setSelectedLead(null)
    } catch (error: any) {
      alert('Error assigning lead: ' + error.message)
    } finally {
      setAssigning(false)
    }
  }

  const filtered = leads.filter(lead => {
    const matchesSearch = (lead.address?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (lead.owner_name?.toLowerCase() || '').includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Head>
        <title>Leads | SignalCore CRM</title>
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Inventory</h1>
            <p className="text-slate-400 mt-1">
              {loading ? 'Loading...' : `${leads.length} total leads • ${leads.filter(l => l.status === 'available').length} available`}
            </p>
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
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading leads...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Property</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Owner</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Size</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Built</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">POC</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Actions</th>
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
                            {lead.city || 'Spokane'}, {lead.state || 'WA'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <User size={14} className="text-slate-400" />
                        {lead.owner_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-300">
                      {lead.building_sqft ? `${lead.building_sqft.toLocaleString()} SF` : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-300">
                      {lead.year_built || '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-500/20 text-teal-400 rounded-full text-sm font-bold">
                        {lead.poc_score || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm capitalize ${statusColors[lead.status] || 'text-slate-400'}`}>
                        ● {lead.status || 'available'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {lead.status === 'available' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                          className="px-3 py-1 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-navy-900 rounded border border-teal-500/20 transition-all text-xs font-semibold"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Assign Lead</h2>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-navy-800 rounded-lg border border-white/5">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Target Lead</p>
              <p className="text-white font-medium">{selectedLead.address}</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-300">Select a contractor to assign this lead to:</p>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {contractors.length === 0 ? (
                  <p className="text-sm text-amber-400">No active contractors found. Add one first!</p>
                ) : (
                  contractors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleAssignLead(c.id)}
                      disabled={assigning}
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-teal-500/10 rounded-lg border border-white/10 hover:border-teal-500/30 transition-all group"
                    >
                      <span className="text-white group-hover:text-teal-400 transition-colors">{c.company_name}</span>
                      <Check size={16} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedLead(null)}
              className="w-full py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
