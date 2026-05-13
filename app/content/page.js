"use client";
import { useState } from "react";
import { useAI } from "@/lib/useAI";
import AIOutput from "@/components/shared/AIOutput";
import { FileText, Sparkles, RefreshCw } from "lucide-react";

const BIZ_TYPES   = ["Management consultancy","Accounting / Finance firm","IT services company","HR consultancy","Digital marketing agency","Logistics company","Legal firm","Training provider"];
const CONTENT_TYPES = ["LinkedIn post","Cold outreach email","Instagram caption","Blog article intro","WhatsApp broadcast","Company announcement"];
const TONES       = ["Professional but approachable","Casual and friendly","Authoritative and expert","Energetic and motivating"];

const TABS = [
  { id:"generate",  label:"Content generator" },
  { id:"repurpose", label:"Repurposer" },
  { id:"proposal",  label:"Proposal writer" },
];

export default function ContentPage() {
  const [tab, setTab] = useState("generate");

  // Generate
  const [bizType,     setBizType]     = useState("Management consultancy");
  const [contentType, setContentType] = useState("LinkedIn post");
  const [topic,       setTopic]       = useState("");
  const [tone,        setTone]        = useState("Professional but approachable");
  const gen = useAI("content");

  // Repurpose
  const [original, setOriginal] = useState("");
  const rep = useAI("content");

  // Proposal
  const [clientName, setClientName] = useState("");
  const [service,    setService]    = useState("");
  const [notes,      setNotes]      = useState("");
  const prop = useAI("proposal");

  async function handleGenerate() {
    const extras = {
      "LinkedIn post":       "150-200 words. Punchy opener, 3 value points, soft CTA. Max 3 hashtags.",
      "Cold outreach email": "Include subject line. 100-130 words. Personal feel. Single CTA.",
      "WhatsApp broadcast":  "60-80 words. Casual, warm. Reply YES CTA.",
      "Blog article intro":  "120-150 words. Hook, establish problem, tease solution.",
      "Instagram caption":   "80-100 words. Conversational, question at end. 4-5 hashtags.",
    }[contentType] || "";

    await gen.generate(
      `Write a ${contentType} for a Singapore ${bizType}.\nTopic: ${topic || "AI tools that help SMEs grow"}\nTone: ${tone}\n${extras}\nOutput only the content.`
    );
  }

  async function handleRepurpose() {
    if (!original.trim()) return;
    await rep.generate(
      `Repurpose this content into 3 formats for a Singapore SME:\n\n${original}\n\n` +
      `FORMAT 1 — LinkedIn Post (150 words max, 3 hashtags):\n[content]\n\n` +
      `FORMAT 2 — WhatsApp Broadcast (70 words max, CTA):\n[content]\n\n` +
      `FORMAT 3 — Email Subject + Preview (subject max 50 chars, preview max 90 chars):\n[content]\n\n` +
      `Output only the 3 formats. No commentary.`
    );
  }

  async function handleProposal() {
    if (!notes.trim()) return;
    await prop.generate(
      `Write a professional B2B proposal for a Singapore client.\nClient: ${clientName || "the client"}\nService: ${service || "AI workflow implementation"}\n\nMeeting notes:\n${notes}\n\n` +
      `Structure: 1. Executive Summary  2. Understanding of Needs  3. Scope of Work  4. Deliverables & Timeline  5. Investment (placeholder table)  6. Next Steps\nSingapore professional tone.`,
      { maxTokens: 1500 }
    );
  }

  return (
    <div className="page-wrap">
      <div className="module-header">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-purple-500" />
          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Module 1</span>
        </div>
        <h1 className="module-title">Content Engine</h1>
        <p className="module-sub">Generate posts, emails and proposals for your Singapore SME clients.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Generate */}
      {tab === "generate" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Business type</label>
              <select className="input" value={bizType} onChange={e => setBizType(e.target.value)}>
                {BIZ_TYPES.map(b => <option key={b}>{b}</option>)}
              </select></div>
            <div><label className="label">Content type</label>
              <select className="input" value={contentType} onChange={e => setContentType(e.target.value)}>
                {CONTENT_TYPES.map(c => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div><label className="label">Topic or key message</label>
            <input className="input" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. How AI saves Singapore SMEs 20 hours a week" /></div>
          <div><label className="label">Tone</label>
            <select className="input" value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select></div>
          <button className="btn-primary" onClick={handleGenerate} disabled={gen.loading}>
            {gen.loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Generating...</> : <><Sparkles size={15} /> Generate content</>}
          </button>
          <AIOutput result={gen.result} loading={gen.loading} error={gen.error} onRegenerate={handleGenerate} />
        </div>
      )}

      {/* Repurpose */}
      {tab === "repurpose" && (
        <div className="space-y-4">
          <div><label className="label">Paste your original content</label>
            <textarea className="input" rows={6} value={original} onChange={e => setOriginal(e.target.value)}
              placeholder="Paste a blog post, article, or any content here..." /></div>
          <button className="btn-primary" onClick={handleRepurpose} disabled={rep.loading || !original.trim()}>
            {rep.loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Repurposing...</> : <><RefreshCw size={15} /> Repurpose into 3 formats</>}
          </button>
          <AIOutput result={rep.result} loading={rep.loading} error={rep.error} onRegenerate={handleRepurpose} />
        </div>
      )}

      {/* Proposal */}
      {tab === "proposal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Client name / company</label>
              <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Tan's Logistics Pte Ltd" /></div>
            <div><label className="label">Service you're proposing</label>
              <input className="input" value={service} onChange={e => setService(e.target.value)} placeholder="e.g. AI workflow implementation" /></div>
          </div>
          <div><label className="label">Meeting notes or brief</label>
            <textarea className="input" rows={6} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Paste your meeting notes or describe what the client needs..." /></div>
          <button className="btn-primary" onClick={handleProposal} disabled={prop.loading || !notes.trim()}>
            {prop.loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Writing...</> : <><Sparkles size={15} /> Generate proposal</>}
          </button>
          <AIOutput result={prop.result} loading={prop.loading} error={prop.error} onRegenerate={handleProposal} />
        </div>
      )}
    </div>
  );
}
