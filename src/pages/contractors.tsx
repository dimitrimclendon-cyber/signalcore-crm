import { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, Building, X } from 'lucide-react'
import Head from 'next/head'
import { supabase, Contractor } from '@/lib/supabase'

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
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContractor, setNewContractor] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    tier: 'feed' as const,
    monthly_fee: 750,
    status: 'active' as const
  })

  useEffect(() => {
    fetchContractors()
  }, [])

  async function fetchContractors() {
    setLoading(true)
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching contractors:', error)
    } else {
      setContractors(data || [])
    }
    setLoading(false)
  }

  async function handleAddContractor(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('contractors')
      .insert([newContractor])
      .select()

    if (error) {
      alert('Error adding contractor: ' + error.message)
    } else {
      setContractors([data[0], ...contractors])
      setShowAddModal(false)
      setNewContractor({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        tier: 'feed',
        monthly_fee: 750,
        status: 'active'
      })
    }
  }

  const filtered = contractors.filter(c => 
    (c.company_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.contact_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Contractors | SignalCore CRM</title>
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Contractors</h1>
            <p className="text-slate-400 mt-1">Manage your HVAC contractor clients</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors"
          >
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
          {loading ? (
            <div className="col-span-2 py-12 text-center text-slate-400">Loading contractors...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400">No contractors found. Add your first one!</div>
          ) : (
            filtered.map((contractor) => (
              <div key={contractor.id} className="glass-card p-6 hover:border-teal-500/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                      <Building className="text-teal-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{contractor.company_name}</h3>
                      <p className="text-sm text-slate-400">{contractor.contact_name}</p>
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
                    ● {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
                  </span>
                  {contractor.monthly_fee > 0 && (
                    <span className="text-sm text-slate-400">
                      ${contractor.monthly_fee.toLocaleString()}/mo
                    </span>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add New Contractor</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddContractor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                  <input
                    required
                    type="text"
                    value={newContractor.company_name}
                    onChange={e => setNewContractor({...newContractor, company_name: e.target.value})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newContractor.contact_name}
                    onChange={e => setNewContractor({...newContractor, contact_name: e.target.value})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newContractor.phone}
                    onChange={e => setNewContractor({...newContractor, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={newContractor.email}
                    onChange={e => setNewContractor({...newContractor, email: e.target.value})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tier</label>
                  <select
                    value={newContractor.tier}
                    onChange={e => {
                      const tier = e.target.value as any
                      const fees = { feed: 750, priority: 2500, executive: 5000 }
                      setNewContractor({...newContractor, tier, monthly_fee: fees[tier as keyof typeof fees]})
                    }}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="feed">The Feed ($750)</option>
                    <option value="priority">Priority Intel ($2,500)</option>
                    <option value="executive">Executive Partner ($5,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    value={newContractor.monthly_fee}
                    onChange={e => setNewContractor({...newContractor, monthly_fee: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-500 text-navy-900 font-bold rounded-lg hover:bg-teal-400 transition-colors"
                >
                  Add Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
