'use client'

import { useState } from 'react'
import { Save, Database, Key, Bell, User } from 'lucide-react'

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your CRM and integrations</p>
      </div>

      {/* Database Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Database className="text-teal-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Database Connection</h3>
            <p className="text-sm text-slate-400">Connect to Supabase for cloud storage</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Supabase URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Anon Key</label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Bell className="text-purple-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-sm text-slate-400">Configure email and alert settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">New payment notifications</p>
              <p className="text-xs text-slate-400">Get notified when a payment is received</p>
            </div>
            <button className="w-12 h-6 bg-teal-500 rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Lead assignment alerts</p>
              <p className="text-xs text-slate-400">Get notified when leads are assigned</p>
            </div>
            <button className="w-12 h-6 bg-teal-500 rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Profile</h3>
            <p className="text-sm text-slate-400">Your account information</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Name</label>
            <input
              type="text"
              defaultValue="Dimitri"
              className="w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="leads@signalcoredata.com"
              className="w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-navy-900 font-semibold rounded-lg transition-colors">
        <Save size={20} />
        Save Settings
      </button>
    </div>
  )
}
