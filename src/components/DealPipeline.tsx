import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DealPipeline() {
  const [stats, setStats] = useState({
    activeCount: 0,
    activeValue: 0,
    pendingCount: 0,
    pendingValue: 0,
    paidCount: 0,
    paidValue: 0,
    totalDeals: 0,
    totalValue: 0,
    loading: true
  })

  useEffect(() => {
    fetchPipelineStats()
  }, [])

  async function fetchPipelineStats() {
    const { data: deals } = await supabase
      .from('deals')
      .select('amount, status')
    
    if (!deals) {
      setStats(prev => ({ ...prev, loading: false }))
      return
    }

    const s = {
      activeCount: 0, activeValue: 0,
      pendingCount: 0, pendingValue: 0,
      paidCount: 0, paidValue: 0,
      totalDeals: deals.length,
      totalValue: deals.reduce((sum, d) => sum + Number(d.amount), 0),
      loading: false
    }

    deals.forEach(d => {
      const amount = Number(d.amount)
      if (d.status === 'active') { s.activeCount++; s.activeValue += amount }
      else if (d.status === 'pending') { s.pendingCount++; s.pendingValue += amount }
      else if (d.status === 'paid') { s.paidCount++; s.paidValue += amount }
    })

    setStats(s)
  }

  const stages = [
    { name: 'Pending', count: stats.pendingCount, value: stats.pendingValue, color: 'bg-amber-500' },
    { name: 'Active', count: stats.activeCount, value: stats.activeValue, color: 'bg-emerald-500' },
    { name: 'Paid', count: stats.paidCount, value: stats.paidValue, color: 'bg-blue-500' },
  ]

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Deal Pipeline</h3>
        <span className="text-sm text-slate-400">
          Total: <span className="text-teal-400 font-semibold">${stats.totalValue.toLocaleString()}</span>
        </span>
      </div>

      <div className="space-y-4">
        {stats.loading ? (
          <div className="text-sm text-slate-400">Loading pipeline...</div>
        ) : (
          stages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className="w-24 text-sm text-slate-300">{stage.name}</div>
              <div className="flex-1 h-8 bg-navy-900 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${stage.color} transition-all duration-500`}
                  style={{ width: stats.totalValue > 0 ? `${(stage.value / stats.totalValue) * 100}%` : '0%' }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs font-medium text-white">{stage.count} deals</span>
                  <span className="text-xs font-medium text-white">${stage.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{stats.totalDeals}</div>
          <div className="text-xs text-slate-400">Total Deals</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeCount}</div>
          <div className="text-xs text-slate-400">Active</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-teal-400">${stats.activeValue.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Active Value</div>
        </div>
      </div>
    </div>
  )
}
