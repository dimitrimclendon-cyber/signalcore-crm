import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const typeColors: Record<string, string> = {
  contractor: 'bg-blue-500/20 text-blue-400',
  lead: 'bg-purple-500/20 text-purple-400',
  payment: 'bg-emerald-500/20 text-emerald-400',
  deal: 'bg-amber-500/20 text-amber-400',
  default: 'bg-slate-500/20 text-slate-400',
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  async function fetchRecentActivity() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    setActivities(data || [])
    setLoading(false)
  }

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'Just now'
  }

  const getLogType = (activity: any) => {
    if (activity.deal_id) return 'deal'
    if (activity.lead_id) return 'lead'
    if (activity.contractor_id) return 'contractor'
    return 'default'
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-slate-400">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-slate-400">No recent activity.</div>
        ) : (
          activities.map((activity) => {
            const type = getLogType(activity)
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeColors[type] || typeColors.default}`}>
                  {type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.action}</p>
                  <p className="text-xs text-slate-400 truncate">{activity.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {getRelativeTime(activity.created_at)}
                </span>
              </div>
            )
          })
        )}
      </div>
      <a href="/activity" className="block w-full mt-4 py-2 text-center text-sm text-teal-400 hover:text-teal-300 transition-colors">
        View All Activity →
      </a>
    </div>
  )
}
