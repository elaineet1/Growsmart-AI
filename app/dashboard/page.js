"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FileText, Users, MessageCircle, Settings, ArrowRight, Zap } from "lucide-react";

const MODULES = [
  { href:"/content",  icon:FileText,       color:"bg-purple-50 text-purple-600 border-purple-100", title:"Content Engine",   desc:"Generate LinkedIn posts, cold emails, proposals and repurpose content in seconds.",          actions:["LinkedIn post","Cold email","Proposal draft","Repurpose"] },
  { href:"/leads",    icon:Users,          color:"bg-teal-50 text-teal-600 border-teal-100",       title:"Lead Generator",   desc:"Find Singapore leads matching your ICP and write personalised outreach messages.",            actions:["Find SG leads","ICP scoring","Write opener","Export CSV"] },
  { href:"/chatbot",  icon:MessageCircle,  color:"bg-blue-50 text-blue-600 border-blue-100",       title:"CX Chatbot",       desc:"Upload your FAQ and get a 24/7 AI chatbot that handles customer enquiries automatically.",     actions:["Upload FAQ","Test chatbot","Embed widget","Telegram"] },
  { href:"/ops",      icon:Settings,       color:"bg-amber-50 text-amber-600 border-amber-100",    title:"Ops Tools",        desc:"Process invoices, summarise contracts, and turn meeting notes into action items instantly.",   actions:["Process docs","Meeting notes","Client check-in","Flag issues"] },
];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-xs font-medium text-teal-600 uppercase tracking-wider">GrowSmart AI</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{getGreeting()}, {firstName}</h1>
        <p className="text-gray-500 mt-1 text-sm">Your AI team is ready. Pick a module to get started.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Modules available", value: "4" },
          { label: "AI model", value: "Claude" },
          { label: "Plan", value: session?.user?.plan || "starter" },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-semibold text-gray-900 capitalize">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-2 gap-5">
        {MODULES.map(mod => (
          <Link key={mod.href} href={mod.href}
            className="card p-5 hover:shadow-md transition-shadow group block">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${mod.color}`}>
                <mod.icon size={18} />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">{mod.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{mod.desc}</p>
            <div className="flex flex-wrap gap-1">
              {mod.actions.map(a => (
                <span key={a} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{a}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
