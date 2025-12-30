import { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  Settings, 
  Building2, 
  Key, 
  Bell, 
  Database, 
  Mail, 
  Globe, 
  Save,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'


interface SettingsSection {
  id: string
  title: string
  icon: any
}

const sections: SettingsSection[] = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'api', title: 'API Keys', icon: Key },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'pipeline', title: 'Pipeline Settings', icon: Database },
  { id: 'email', title: 'Email Templates', icon: Mail },
  { id: 'integrations', title: 'Integrations', icon: Globe },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('business')
  const [saved, setSaved] = useState(false)
  
  // Business settings
  const [businessName, setBusinessName] = useState('SignalCore Data')
  const [contactEmail, setContactEmail] = useState('dimitri@signalcoredata.com')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('https://signalcoredata.com')
  
  // API Keys
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const [showKeys, setShowKeys] = useState(false)
  
  // Pipeline settings
  const [platinumThreshold, setPlatinumThreshold] = useState(80)
  const [goldThreshold, setGoldThreshold] = useState(60)
  const [silverThreshold, setSilverThreshold] = useState(40)
  const [staleLeadDays, setStaleLeadDays] = useState(14)
  
  // Notification settings
  const [emailNewLead, setEmailNewLead] = useState(true)
  const [emailDealClosed, setEmailDealClosed] = useState(true)
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(true)
  const [slackEnabled, setSlackEnabled] = useState(false)
  
  function handleSave() {
    // In production, this would save to Supabase
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <Head>
        <title>Settings | SignalCore CRM</title>
      </Head>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-1">Manage your CRM configuration</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              saved 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-teal-500 text-white hover:bg-teal-400'
            }`}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="glass-card p-4">
            <nav className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 glass-card p-6">
            {/* Business Info */}
            {activeSection === 'business' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-teal-400" />
                  Business Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Key size={20} className="text-teal-400" />
                  API Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Supabase URL</label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      readOnly
                      className="w-full bg-navy-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-slate-400">API Keys</label>
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        {showKeys ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showKeys ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="bg-navy-800/50 border border-white/10 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Supabase Anon Key</span>
                        <code className="text-xs text-slate-500">
                          {showKeys ? 'sb_publishable_XbXJ...' : '••••••••••••••••'}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Stripe Secret Key</span>
                        <code className="text-xs text-slate-500">
                          {showKeys ? 'sk_test_...' : '••••••••••••••••'}
                        </code>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      API keys are stored as environment variables. Update them in Vercel dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Bell size={20} className="text-teal-400" />
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase">Email Notifications</h3>
                  
                  <ToggleRow
                    label="New Lead Assigned"
                    description="Get notified when a new lead is assigned to a contractor"
                    checked={emailNewLead}
                    onChange={setEmailNewLead}
                  />
                  <ToggleRow
                    label="Deal Closed"
                    description="Get notified when a contractor closes a deal"
                    checked={emailDealClosed}
                    onChange={setEmailDealClosed}
                  />
                  <ToggleRow
                    label="Weekly Summary"
                    description="Receive a weekly digest of pipeline performance"
                    checked={emailWeeklySummary}
                    onChange={setEmailWeeklySummary}
                  />
                  
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Integrations</h3>
                    <ToggleRow
                      label="Slack Notifications"
                      description="Send notifications to a Slack channel"
                      checked={slackEnabled}
                      onChange={setSlackEnabled}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Settings */}
            {activeSection === 'pipeline' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Database size={20} className="text-teal-400" />
                  Pipeline Configuration
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Lead Tier Thresholds</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Set the POC score thresholds for automatic lead tiering.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <span className="px-2 py-1 bg-slate-300/20 text-slate-300 rounded text-xs font-bold">PLATINUM</span>
                        </div>
                        <span className="text-slate-400">≥</span>
                        <input
                          type="number"
                          value={platinumThreshold}
                          onChange={(e) => setPlatinumThreshold(Number(e.target.value))}
                          className="w-20 bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-teal-500"
                        />
                        <span className="text-slate-400">POC score</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <span className="px-2 py-1 bg-amber-400/20 text-amber-400 rounded text-xs font-bold">GOLD</span>
                        </div>
                        <span className="text-slate-400">≥</span>
                        <input
                          type="number"
                          value={goldThreshold}
                          onChange={(e) => setGoldThreshold(Number(e.target.value))}
                          className="w-20 bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-teal-500"
                        />
                        <span className="text-slate-400">POC score</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <span className="px-2 py-1 bg-slate-400/20 text-slate-400 rounded text-xs font-bold">SILVER</span>
                        </div>
                        <span className="text-slate-400">≥</span>
                        <input
                          type="number"
                          value={silverThreshold}
                          onChange={(e) => setSilverThreshold(Number(e.target.value))}
                          className="w-20 bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-teal-500"
                        />
                        <span className="text-slate-400">POC score</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Lead Status Rules</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Mark leads as "stale" after</span>
                      <input
                        type="number"
                        value={staleLeadDays}
                        onChange={(e) => setStaleLeadDays(Number(e.target.value))}
                        className="w-20 bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-teal-500"
                      />
                      <span className="text-slate-400">days without activity</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Templates */}
            {activeSection === 'email' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Mail size={20} className="text-teal-400" />
                  Email Templates
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-navy-800/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">New Lead Assignment</h3>
                      <button className="text-sm text-teal-400 hover:text-teal-300">Edit</button>
                    </div>
                    <p className="text-sm text-slate-400">Sent to contractors when they receive a new lead</p>
                  </div>
                  
                  <div className="bg-navy-800/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">Welcome Email</h3>
                      <button className="text-sm text-teal-400 hover:text-teal-300">Edit</button>
                    </div>
                    <p className="text-sm text-slate-400">Sent to new contractors after signup</p>
                  </div>
                  
                  <div className="bg-navy-800/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">Weekly Digest</h3>
                      <button className="text-sm text-teal-400 hover:text-teal-300">Edit</button>
                    </div>
                    <p className="text-sm text-slate-400">Weekly performance summary for contractors</p>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeSection === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Globe size={20} className="text-teal-400" />
                  Integrations
                </h2>
                
                <div className="space-y-4">
                  <IntegrationCard
                    name="Stripe"
                    description="Payment processing for subscriptions"
                    status="connected"
                  />
                  <IntegrationCard
                    name="Supabase"
                    description="Database and authentication"
                    status="connected"
                  />
                  <IntegrationCard
                    name="Slack"
                    description="Team notifications"
                    status="not_connected"
                  />
                  <IntegrationCard
                    name="Zapier"
                    description="Workflow automation"
                    status="not_connected"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          checked ? 'bg-teal-500' : 'bg-slate-600'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

function IntegrationCard({ name, description, status }: {
  name: string
  description: string
  status: 'connected' | 'not_connected'
}) {
  return (
    <div className="bg-navy-800/50 border border-white/10 rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium text-white">{name}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {status === 'connected' ? (
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
          Connected
        </span>
      ) : (
        <button className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-lg text-sm hover:bg-teal-500/20 transition-colors">
          Connect
        </button>
      )}
    </div>
  )
}
