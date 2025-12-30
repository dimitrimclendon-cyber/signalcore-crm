import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
}

export default function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400',
  }

  return (
    <div className="glass-card stat-card p-6 transition-all hover:border-teal-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-teal-500/10 rounded-lg">
          <Icon className="text-teal-400" size={24} />
        </div>
        <span className={`text-sm font-medium ${changeColors[changeType]}`}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-sm text-slate-400 mt-1">{title}</p>
    </div>
  )
}
