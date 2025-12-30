'use client'

import { useState } from 'react'
import { Plus, Filter, Calendar, User, DollarSign, FileText } from 'lucide-react'

const activities = [
  { id: '1', action: 'Contractor Added', details: 'Added Inland Mechanical as a Priority Intel subscriber', contractor: 'Inland Mechanical', type: 'contractor', timestamp: '2024-12-29T15:30:00' },
  { id: '2', action: 'Lead Assigned', details: 'Assigned 3905 S Dishman Mica Rd to Inland Mechanical', contractor: 'Inland Mechanical', type: 'lead', timestamp: '2024-12-29T14:15:00' },
  { id: '3', action: 'Payment Received', details: 'Monthly subscription payment of $2,500', contractor: 'Spokane HVAC Pro', type: 'payment', timestamp: '2024-12-28T10:00:00' },
  { id: '4', action: 'Success Fee Earned', details: 'Earned $1,000 success fee on closed contract', contractor: 'Inland Mechanical', type: 'payment', timestamp: '2024-12-27T16:45:00' },
  { id: '5', action: 'New Deal Created', details: 'Created Executive Partner subscription', contractor: 'Spokane HVAC Pro', type: 'deal', timestamp: '2024-12-26T09:30:00' },
  { id: '6', action: 'Lead Imported', details: 'Imported 50 new leads from Spokane County assessor', contractor: null, type: 'lead', timestamp: '2024-12-25T08:00:00' },
  { id: '7', action: 'Email Sent', details: 'Sent outreach email to Northwest Comfort', contractor: 'Northwest Comfort', type: 'outreach', timestamp: '2024-12-24T14:00:00' },
  { id: '8', action: 'Call Logged', details: 'Discussed pricing with Valley Climate', contractor: 'Valley Climate', type: 'outreach', timestamp: '2024-12-23T11:30:00' },
]

const typeIcons: Record<string, React.ReactNode> = {
  contractor: <User size={16} />,
  lead: <FileText size={16} />,
  payment: <DollarSign size={16} />,
  deal: <DollarSign size={16} />,
  outreach: <User size={16} />,
}

const typeColors: Record<string, string> = {
  contractor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  lead: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  payment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  deal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  outreach: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

export default function ActivityPage() {
  const [filter, setFilter] = useState('all')

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 mt-1">Track all system and user actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors">
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
        {['all', 'contractor', 'lead', 'payment', 'deal', 'outreach'].map((type) => (
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
        {filteredActivities.map((activity, index) => (
          <div key={activity.id} className="glass-card p-4 hover:border-teal-500/30 transition-all">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-2 rounded-lg border ${typeColors[activity.type]}`}>
                {typeIcons[activity.type]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{activity.action}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{activity.details}</p>
                {activity.contractor && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-navy-900 text-slate-300 rounded">
                    {activity.contractor}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
