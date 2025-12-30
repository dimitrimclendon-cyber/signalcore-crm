import { useState, useEffect } from 'react'
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import RecentActivity from '@/components/RecentActivity'
import DealPipeline from '@/components/DealPipeline'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeContractors: 0,
    availableLeads: 0,
    dealsThisMonth: 0,
    loading: true
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      // 1. Total Revenue (Sum of paid/active deals)
      const { data: dealsData } = await supabase
        .from('deals')
        .select('amount')
        .or('status.eq.paid,status.eq.active')
      
      const totalRevenue = dealsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

      // 2. Active Contractors
      const { count: activeContractors } = await supabase
        .from('contractors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // 3. Available Leads
      const { count: availableLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')

      // 4. Deals This Month
      const firstDayOfMonth = new Date()
      firstDayOfMonth.setDate(1)
      firstDayOfMonth.setHours(0, 0, 0, 0)
      
      const { count: dealsThisMonth } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString())

      setStats({
        totalRevenue,
        activeContractors: activeContractors || 0,
        availableLeads: availableLeads || 0,
        dealsThisMonth: dealsThisMonth || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard | SignalCore CRM</title>
      </Head>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back. Here&apos;s your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={stats.loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
            change="+0%"
            changeType="neutral"
            icon={DollarSign}
          />
          <StatsCard
            title="Active Contractors"
            value={stats.loading ? '...' : stats.activeContractors.toString()}
            change="+0"
            changeType="neutral"
            icon={Users}
          />
          <StatsCard
            title="Available Leads"
            value={stats.loading ? '...' : stats.availableLeads.toString()}
            change="Live"
            changeType="positive"
            icon={FileText}
          />
          <StatsCard
            title="Deals This Month"
            value={stats.loading ? '...' : stats.dealsThisMonth.toString()}
            change="+0"
            changeType="neutral"
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
    </>
  )
}
