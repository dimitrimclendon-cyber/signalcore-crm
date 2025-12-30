import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Activity,
  Settings
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contractors', href: '/contractors', icon: Users },
  { name: 'Leads', href: '/leads', icon: FileText },
  { name: 'Deals', href: '/deals', icon: DollarSign },
  { name: 'Activity', href: '/activity', icon: Activity },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = router.pathname

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/10">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">
          <span className="text-teal-400">Signal</span>Core CRM
        </h1>
        <p className="text-xs text-slate-400 mt-1">Lead Management System</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} legacyBehavior>
              <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <Link href="/settings" legacyBehavior>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </Link>
      </div>
    </aside>
  )
}
