import { useState, useEffect } from 'react'
import { Plus, Filter, Calendar, User, DollarSign, FileText } from 'lucide-react'
import Head from 'next/head'
import { supabase, Activity } from '@/lib/supabase'

const typeColors: Record<string, string> = {
  contractor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  lead: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  payment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  deal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const typeIcons: Record<string, JSX.Element> = {
  contractor: <User size={16} />,
  lead: <FileText size={16} />,
  payment: <DollarSign size={16} />,
  deal: <DollarSign size={16} />,
  default: <FileText size={16} />,
}

interface ActivityWithDetails extends Activity {
  contractors: { company_name: string } | null
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*, contractors(company_name)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching activities:', error)
    } else {
      setActivities(data as any || [])
    }
    setLoading(false)
  }

  const getLogType = (activity: Activity) => {
    if (activity.deal_id) return 'deal'
    if (activity.lead_id) return 'lead'
    if (activity.contractor_id) return 'contractor'
    return 'default'
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => getLogType(a) === filter)

  return (
    <>
      <Head>
        <title>Activity | SignalCore CRM</title>
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Activity Log</h1>
            <p className="text-slate-400 mt-1">Track all system and user actions</p>
          </div>
          <button 
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-teal-500/50 text-navy-900/50 font-semibold rounded-lg cursor-not-allowed"
          >
            <Plus size={20} />
            Log Activity
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm">Filter:</span>
          </div>
          {['all', 'contractor', 'lead', 'deal'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === type
                  ? 'bg-teal-500 text-navy-900 font-medium'
                  : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading activity log...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No activity logged yet.</div>
          ) : (
            filteredActivities.map((activity) => {
              const type = getLogType(activity)
              return (
                <div key={activity.id} className="glass-card p-4 hover:border-teal-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg border ${typeColors[type] || typeColors.default}`}>
                      {typeIcons[type] || typeIcons.default}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{activity.action}</h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{activity.details}</p>
                      {activity.contractors?.company_name && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-navy-900 text-slate-300 rounded">
                          {activity.contractors.company_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
