"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, FileText, Users, MessageCircle, Settings, LogOut, Zap } from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/content",   icon: FileText,        label: "Content Engine" },
  { href: "/leads",     icon: Users,           label: "Lead Generator" },
  { href: "/chatbot",   icon: MessageCircle,   label: "CX Chatbot"     },
  { href: "/ops",       icon: Settings,        label: "Ops Tools"      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-60 bg-slate-900 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">GrowSmart AI</p>
            <p className="text-white/40 text-xs">Revenue Tools</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}>
              <item.icon size={17} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
          <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 w-full text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}
