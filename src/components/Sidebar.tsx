import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingCart,
  User,
  CreditCard,
  Package,
  HelpCircle,
  Target,
  BarChart3,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Intelligence Hub", href: "/leads", icon: ShoppingCart },
  { name: "Active Signals", href: "/my-leads", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Account", href: "/account", icon: User },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="w-7 h-7 text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Signal<span className="text-emerald-400">Core</span>
          </h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">
          IntelliLead Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} legacyBehavior>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <a
          href="mailto:support@signalcoredata.com"
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors"
        >
          <HelpCircle size={20} />
          <span className="text-sm">Need Help?</span>
        </a>
      </div>
    </aside>
  );
}
