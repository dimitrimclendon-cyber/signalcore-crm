'use client'

import { useState } from 'react'
import { Plus, DollarSign, Calendar, Building } from 'lucide-react'

const initialDeals = [
  { id: '1', contractor: 'Inland Mechanical', type: 'subscription', tier: 'Priority Intel', amount: 2500, status: 'active', startDate: '2024-12-01' },
  { id: '2', contractor: 'Spokane HVAC Pro', type: 'subscription', tier: 'Executive Partner', amount: 5000, status: 'active', startDate: '2024-11-15' },
  { id: '3', contractor: 'Valley Climate', type: 'subscription', tier: 'The Feed', amount: 750, status: 'active', startDate: '2024-12-10' },
  { id: '4', contractor: 'Inland Mechanical', type: 'success_fee', tier: 'Success Fee', amount: 1000, status: 'paid', startDate: '2024-12-20' },
  { id: '5', contractor: 'Northwest Comfort', type: 'subscription', tier: 'Priority Intel', amount: 2500, status: 'pending', startDate: '2024-12-28' },
]

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

export default function DealsPage() {
  const [deals] = useState(initialDeals)

  const totalMRR = deals
    .filter(d => d.type === 'subscription' && d.status === 'active')
    .reduce((sum, d) => sum + d.amount, 0)

  const totalSuccessFees = deals
    .filter(d => d.type === 'success_fee')
    .reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Deals</h1>
          <p className="text-slate-400 mt-1">Track subscriptions and success fees</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors">
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
              <p className="text-2xl font-bold text-white">${totalMRR.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-white">${totalSuccessFees.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-white">{deals.filter(d => d.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Contractor</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Type</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Tier</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Amount</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Start Date</th>
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
                    <span className="text-sm font-medium text-white">{deal.contractor}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs rounded ${typeBadges[deal.type]}`}>
                    {deal.type === 'success_fee' ? 'Success Fee' : 'Subscription'}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">{deal.tier}</td>
                <td className="py-4 px-6 text-right text-sm font-medium text-white">
                  ${deal.amount.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-sm text-slate-300 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(deal.startDate).toLocaleDateString()}
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
      </div>
    </div>
  )
}
