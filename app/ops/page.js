"use client";
import { useState } from "react";
import { useAI } from "@/lib/useAI";
import AIOutput from "@/components/shared/AIOutput";
import { Settings, FileText, AlertTriangle } from "lucide-react";

const DOC_TYPES = ["Invoice","Contract / Agreement","Purchase Order","Meeting minutes","Financial report","HR policy","Compliance document","Other"];
const TABS = [
  { id:"docs",    label:"Document processor" },
  { id:"checkin", label:"Client check-in" },
  { id:"notes",   label:"Meeting notes" },
];

export default function OpsPage() {
  const [tab, setTab] = useState("docs");

  const [docText,  setDocText]  = useState("");
  const [docType,  setDocType]  = useState("Invoice");
  const doc = useAI("ops");

  const [clientName, setClientName] = useState("");
  const [lastContact, setLastContact] = useState("");
  const [relationship, setRelationship] = useState("");
  const checkin = useAI("content");

  const [meetingNotes, setMeetingNotes] = useState("");
  const notes = useAI("ops");

  async function handleDoc() {
    await doc.generate(
      `Analyse this ${docType} for a Singapore SME:\n\n${docText}\n\nProvide:\n1. KEY INFORMATION (amounts, dates, parties, terms)\n2. ACTION ITEMS (what needs to be done and by when)\n3. RED FLAGS (anything unusual, risky, or missing — if none, say "None identified")\n4. SUMMARY (2-3 sentence plain English overview)\n\nBe precise. Flag any SG compliance issues (GST, MOM, PDPA) if relevant.`
    );
  }

  async function handleCheckin() {
    await checkin.generate(
      `Write a warm, professional client check-in message for Singapore B2B.\nClient: ${clientName || "the client"}\nLast contact: ${lastContact || "about a month ago"}\nContext: ${relationship || "ongoing service relationship"}\n\nKeep it: personal, brief (under 80 words), genuine — not salesy. Works as WhatsApp or email. Output only the message.`
    );
  }

  async function handleNotes() {
    await notes.generate(
      `Process these meeting notes:\n\n${meetingNotes}\n\nOutput:\nMEETING SUMMARY (2-3 sentences)\n\nDECISIONS MADE\n- [list]\n\nACTION ITEMS\n- [Task] | Owner: [who] | Due: [when]\n\nFOLLOW-UP QUESTIONS\n- [anything unresolved]\n\nBe concise and actionable.`
    );
  }

  const Spinner = () => <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />;

  return (
    <div className="page-wrap">
      <div className="module-header">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={16} className="text-amber-500" />
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Module 4</span>
        </div>
        <h1 className="module-title">Ops Tools</h1>
        <p className="module-sub">Process documents, schedule check-ins, and turn meeting notes into action items.</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === "docs" && (
        <div className="space-y-4">
          <div className="card p-3 border-amber-100 bg-amber-50 flex gap-2">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Do not include personal NRIC numbers or full bank account details.</p>
          </div>
          <div><label className="label">Document type</label>
            <select className="input" value={docType} onChange={e => setDocType(e.target.value)}>
              {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
            </select></div>
          <div><label className="label">Paste document content</label>
            <textarea className="input" rows={8} value={docText} onChange={e => setDocText(e.target.value)}
              placeholder="Paste the text content of your document here..." /></div>
          <button className="btn-primary" onClick={handleDoc} disabled={doc.loading || !docText.trim()}>
            {doc.loading ? <><Spinner /> Processing...</> : <><FileText size={15} /> Process document</>}
          </button>
          <AIOutput result={doc.result} loading={doc.loading} error={doc.error} onRegenerate={handleDoc} />
        </div>
      )}

      {tab === "checkin" && (
        <div className="space-y-4">
          <div><label className="label">Client name / company</label>
            <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. David Tan, ABC Consulting" /></div>
          <div><label className="label">Last contact</label>
            <input className="input" value={lastContact} onChange={e => setLastContact(e.target.value)} placeholder="e.g. 3 weeks ago, after project delivery" /></div>
          <div><label className="label">Relationship context</label>
            <textarea className="input" rows={2} value={relationship} onChange={e => setRelationship(e.target.value)}
              placeholder="e.g. Ongoing retainer, completed AI implementation last month" /></div>
          <button className="btn-primary" onClick={handleCheckin} disabled={checkin.loading}>
            {checkin.loading ? <><Spinner /> Writing...</> : "Write check-in message"}
          </button>
          <AIOutput result={checkin.result} loading={checkin.loading} error={checkin.error} onRegenerate={handleCheckin} />
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-4">
          <div><label className="label">Paste your raw meeting notes</label>
            <textarea className="input" rows={8} value={meetingNotes} onChange={e => setMeetingNotes(e.target.value)}
              placeholder="Paste rough notes, voice note transcript, or any unstructured notes here..." /></div>
          <button className="btn-primary" onClick={handleNotes} disabled={notes.loading || !meetingNotes.trim()}>
            {notes.loading ? <><Spinner /> Processing...</> : <><FileText size={15} /> Summarise &amp; extract actions</>}
          </button>
          <AIOutput result={notes.result} loading={notes.loading} error={notes.error} onRegenerate={handleNotes} />
        </div>
      )}
    </div>
  );
}
