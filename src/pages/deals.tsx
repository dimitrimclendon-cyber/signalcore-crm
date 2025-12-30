import { useState, useEffect } from 'react'
import { Plus, DollarSign, Calendar, Building, X } from 'lucide-react'
import Head from 'next/head'
import { supabase, Deal, Contractor } from '@/lib/supabase'

const statusBadges: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const typeBadges: Record<string, string> = {
  subscription: 'bg-purple-500/20 text-purple-300',
  success_fee: 'bg-teal-500/20 text-teal-300',
  lead_sale: 'bg-blue-500/20 text-blue-300',
}

interface DealWithContractor extends Deal {
  contractors: { company_name: string } | null
}

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithContractor[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    contractor_id: '',
    deal_type: 'subscription' as const,
    amount: 0,
    status: 'pending' as const,
    notes: ''
  })

  useEffect(() => {
    fetchDeals()
    fetchContractors()
  }, [])

  async function fetchDeals() {
    setLoading(true)
    const { data, error } = await supabase
      .from('deals')
      .select('*, contractors(company_name)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching deals:', error)
    } else {
      setDeals(data as any || [])
    }
    setLoading(false)
  }

  async function fetchContractors() {
    const { data } = await supabase.from('contractors').select('id, company_name, tier, monthly_fee').eq('status', 'active')
    setContractors(data || [])
  }

  async function handleAddDeal(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('deals')
      .insert([newDeal])
      .select('*, contractors(company_name)')

    if (error) {
      alert('Error adding deal: ' + error.message)
    } else {
      setDeals([data[0] as any, ...deals])
      setShowAddModal(false)
      setNewDeal({
        contractor_id: '',
        deal_type: 'subscription',
        amount: 0,
        status: 'pending',
        notes: ''
      })
    }
  }

  const totalMRR = deals
    .filter(d => d.deal_type === 'subscription' && d.status === 'active')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const totalSuccessFees = deals
    .filter(d => d.deal_type === 'success_fee')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <>
      <Head>
        <title>Deals | SignalCore CRM</title>
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Deals</h1>
            <p className="text-slate-400 mt-1">Track subscriptions and success fees</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Deal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <DollarSign className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : `$${totalMRR.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-lg">
                <DollarSign className="text-teal-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Success Fees Earned</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : `$${totalSuccessFees.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Building className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : deals.filter(d => d.deal_type === 'subscription' && d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading deals...</div>
          ) : deals.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No deals found. Create your first one!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Contractor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                          <Building size={18} className="text-teal-400" />
                        </div>
                        <span className="text-sm font-medium text-white">{deal.contractors?.company_name || 'Deleted'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded capitalize ${typeBadges[deal.deal_type]}`}>
                        {deal.deal_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-medium text-white">
                      ${Number(deal.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${statusBadges[deal.status]}`}>
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Deal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contractor</label>
                <select
                  required
                  value={newDeal.contractor_id}
                  onChange={e => {
                    const contractor = contractors.find(c => c.id === e.target.value)
                    setNewDeal({
                      ...newDeal, 
                      contractor_id: e.target.value,
                      amount: newDeal.deal_type === 'subscription' ? (contractor?.monthly_fee || 0) : newDeal.amount
                    })
                  }}
                  className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                >
                  <option value="">Select a contractor...</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Deal Type</label>
                  <select
                    value={newDeal.deal_type}
                    onChange={e => {
                      const type = e.target.value as any
                      const contractor = contractors.find(c => c.id === newDeal.contractor_id)
                      setNewDeal({
                        ...newDeal, 
                        deal_type: type,
                        amount: type === 'subscription' ? (contractor?.monthly_fee || 0) : newDeal.amount
                      })
                    }}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="subscription">Subscription</option>
                    <option value="success_fee">Success Fee</option>
                    <option value="lead_sale">Single Lead Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input
                    required
                    type="number"
                    value={newDeal.amount}
                    onChange={e => setNewDeal({...newDeal, amount: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={newDeal.status}
                    onChange={e => setNewDeal({...newDeal, status: e.target.value as any})}
                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  value={newDeal.notes}
                  onChange={e => setNewDeal({...newDeal, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg text-white h-24 focus:outline-none focus:border-teal-500/50"
                  placeholder="Deal details..."
                />
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
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
