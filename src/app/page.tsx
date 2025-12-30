import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import RecentActivity from '@/components/RecentActivity'
import DealPipeline from '@/components/DealPipeline'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value="$12,500"
          change="+23%"
          changeType="positive"
          icon={DollarSign}
        />
        <StatsCard
          title="Active Contractors"
          value="4"
          change="+2"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Available Leads"
          value="257"
          change="-12"
          changeType="neutral"
          icon={FileText}
        />
        <StatsCard
          title="Deals This Month"
          value="8"
          change="+3"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Pipeline */}
        <div className="lg:col-span-2">
          <DealPipeline />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
