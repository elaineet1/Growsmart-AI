"use client";
import { useState } from "react";
import { useAI } from "@/lib/useAI";
import AIOutput from "@/components/shared/AIOutput";
import { Users, Download } from "lucide-react";

const INDUSTRIES = ["Professional services","Manufacturing","Retail","F&B","Logistics","Construction","Healthcare","Education","Technology","Finance"];
const SIZES      = ["Micro (1–10 staff)","Small (11–50 staff)","Medium (51–200 staff)"];
const CHANNELS   = ["LinkedIn message (300 chars)","Cold email","WhatsApp message script"];
const COLORS     = ["#534AB7","#0F6E56","#185FA5","#854F0B","#A32D2D"];

const TABS = [
  { id:"finder",   label:"ICP Lead Finder" },
  { id:"outreach", label:"Outreach Writer" },
];

export default function LeadsPage() {
  const [tab,      setTab]      = useState("finder");
  const [industry, setIndustry] = useState("Professional services");
  const [size,     setSize]     = useState("Small (11–50 staff)");
  const [service,  setService]  = useState("");
  const [pain,     setPain]     = useState("");
  const [leads,    setLeads]    = useState([]);

  const [prospect, setProspect] = useState("");
  const [context,  setContext]  = useState("");
  const [channel,  setChannel]  = useState("LinkedIn message (300 chars)");

  const finder   = useAI("leads");
  const outreach = useAI("content");

  async function handleFindLeads() {
    const raw = await finder.generate(
      `Generate 5 realistic Singapore SME lead profiles.\nTarget: ${industry}, ${size}\nMy service: ${service || "AI workflow solutions"}\nPain I solve: ${pain || "manual admin work"}\n\n` +
      `Return ONLY this JSON array:\n[{"company":"Name Pte Ltd","contact":"Name, Job Title","area":"SG district","employees":"number","revenue":"est. annual revenue","trigger":"why they need this now (max 12 words)","score":85}]\n\nUse realistic SG company names and districts. Scores 70-95. No markdown.`
    );
    if (!raw) return;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      setLeads(JSON.parse(clean));
    } catch { setLeads([]); }
  }

  async function handleOutreach() {
    await outreach.generate(
      `Write a personalised ${channel} for:\nProspect: ${prospect || "a Singapore SME decision maker"}\nContext: ${context || "growing their business"}\nMy service: ${service || "AI workflow solutions"}\n\nRules: Feel genuinely personal, one low-pressure CTA (15-min chat). Singapore professional tone. Output only the message.`
    );
  }

  function exportCSV() {
    if (!leads.length) return;
    const headers = ["Company","Contact","Area","Employees","Revenue","Trigger","ICP Score"];
    const rows    = leads.map(l => [l.company,l.contact,l.area,l.employees,l.revenue,l.trigger,l.score]);
    const csv     = [headers,...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a       = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download:"sg-leads.csv" });
    a.click();
  }

  return (
    <div className="page-wrap">
      <div className="module-header">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-teal-500" />
          <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Module 2</span>
        </div>
        <h1 className="module-title">Lead Generation Automation</h1>
        <p className="module-sub">AI finds, scores and writes outreach for matching leads — your sales team only talks to the right people.</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Finder */}
      {tab === "finder" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Target industry</label>
              <select className="input" value={industry} onChange={e => setIndustry(e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select></div>
            <div><label className="label">Company size</label>
              <select className="input" value={size} onChange={e => setSize(e.target.value)}>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select></div>
          </div>
          <div><label className="label">Your service</label>
            <input className="input" value={service} onChange={e => setService(e.target.value)} placeholder="e.g. AI workflow implementation for SMEs" /></div>
          <div><label className="label">Pain point you solve</label>
            <input className="input" value={pain} onChange={e => setPain(e.target.value)} placeholder="e.g. Too much manual admin, slow lead generation" /></div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleFindLeads} disabled={finder.loading}>
              {finder.loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Finding...</> : <><Users size={15} /> Find matching leads</>}
            </button>
            {leads.length > 0 && (
              <button className="btn-secondary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
            )}
          </div>
          {finder.error && <p className="text-red-500 text-sm">{finder.error}</p>}
          {leads.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{leads.length} leads found</p>
              {leads.map((lead, i) => {
                const initials = lead.company.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
                return (
                  <div key={i} className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{lead.company}</p>
                      <p className="text-xs text-gray-500 mb-2">{lead.contact} · {lead.area} · {lead.employees} staff</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{lead.revenue}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100">{lead.trigger}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-bold ${Number(lead.score) >= 85 ? "text-teal-600" : "text-amber-500"}`}>{lead.score}</div>
                      <div className="text-[10px] text-gray-400">ICP fit</div>
                      <button onClick={() => { setTab("outreach"); setProspect(`${lead.company}, ${lead.contact}`); setContext(lead.trigger); }}
                        className="text-[11px] text-teal-600 hover:underline mt-1 block">Write outreach →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Outreach */}
      {tab === "outreach" && (
        <div className="space-y-4">
          <div><label className="label">Prospect details</label>
            <input className="input" value={prospect} onChange={e => setProspect(e.target.value)} placeholder="Company & decision maker, e.g. Tan's Logistics, Ops Director" /></div>
          <div><label className="label">Context or trigger</label>
            <textarea className="input" rows={2} value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. Just expanded to JB, likely hiring soon" /></div>
          <div><label className="label">Channel</label>
            <select className="input" value={channel} onChange={e => setChannel(e.target.value)}>
              {CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Your service</label>
            <input className="input" value={service} onChange={e => setService(e.target.value)} placeholder="e.g. AI workflow solutions for SMEs" /></div>
          <button className="btn-primary" onClick={handleOutreach} disabled={outreach.loading}>
            {outreach.loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Writing...</> : "Write personalised opener"}
          </button>
          <AIOutput result={outreach.result} loading={outreach.loading} error={outreach.error} onRegenerate={handleOutreach} />
        </div>
      )}
    </div>
  );
}
