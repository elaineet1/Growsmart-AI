"use client";
import { useState, useRef } from "react";
import { MessageCircle, Send, Bot, User, Upload } from "lucide-react";

const TABS = [
  { id:"setup", label:"Setup FAQ" },
  { id:"chat",  label:"Test chatbot" },
  { id:"embed", label:"Embed code" },
];

export default function ChatbotPage() {
  const [tab,      setTab]      = useState("setup");
  const [faqDoc,   setFaqDoc]   = useState("");
  const [botReady, setBotReady] = useState(false);
  const [messages, setMessages] = useState([{ role:"assistant", content:"Hi! Upload your FAQ document first, then test me here." }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const endRef = useRef(null);

  function setupBot() {
    if (!faqDoc.trim()) return;
    setBotReady(true);
    setTab("chat");
    setMessages([{ role:"assistant", content:"FAQ loaded! I'm ready to answer your customers' questions." }]);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", content:msg }]);
    setLoading(true);
    try {
      const systemOverride = botReady
        ? `You are a helpful customer service AI for a Singapore SME.\nFAQ:\n${faqDoc}\nBe friendly, concise (under 150 words). If not in FAQ, say you'll connect them with a human.`
        : undefined;
      const res  = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ module:"chatbot", prompt:msg, systemOverride, maxTokens:300 }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role:"assistant", content: data.result || "Sorry, something went wrong." }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Error — please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    }
  }

  return (
    <div className="page-wrap">
      <div className="module-header">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle size={16} className="text-blue-500" />
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Module 3</span>
        </div>
        <h1 className="module-title">Customer Service Automation</h1>
        <p className="module-sub">AI handles customer enquiries 24/7 — your team only deals with complex cases that need human judgment.</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === "setup" && (
        <div className="space-y-4">
          <div className="card p-4 border-blue-100 bg-blue-50">
            <p className="text-sm font-medium text-blue-700 mb-1">How it works</p>
            <p className="text-xs text-blue-600 leading-relaxed">Paste your FAQ below. The AI will use it to answer customers accurately on your website or Telegram bot.</p>
          </div>
          <div><label className="label">FAQ content</label>
            <textarea className="input" rows={10} value={faqDoc} onChange={e => setFaqDoc(e.target.value)}
              placeholder={"Q: What are your office hours?\nA: Monday to Friday, 9am to 6pm SGT.\n\nQ: How do I contact support?\nA: Email support@yourcompany.com or WhatsApp +65 xxxx xxxx."} /></div>
          <button className="btn-primary" onClick={setupBot} disabled={!faqDoc.trim()}>
            <Upload size={15} /> Configure chatbot
          </button>
          {botReady && <p className="text-sm text-green-600 font-medium">✓ Chatbot configured. Switch to "Test chatbot".</p>}
        </div>
      )}

      {tab === "chat" && (
        <div className="card overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI Assistant</p>
              <p className="text-white/50 text-xs">{botReady ? "Configured with your FAQ" : "Demo mode"}</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role==="user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}>{m.content}</div>
                {m.role === "user" && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-xl rounded-bl-none flex gap-1">
                  {[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <input className="input flex-1" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()} placeholder="Type a customer question..." />
            <button className="btn-primary py-2 px-3" onClick={send} disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {tab === "embed" && (
        <div className="space-y-4">
          <div className="card p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Website embed snippet</p>
            <p className="text-xs text-gray-500 mb-3">Paste this into your website HTML to add the chatbot widget.</p>
            <div className="output-box text-xs font-mono">{`<!-- GrowSmart AI Chatbot Widget -->\n<script>\n  window.GrowSmartChatbot = {\n    apiUrl: "https://your-app.railway.app/api/ai",\n    module: "chatbot",\n    primaryColor: "#0F9E78"\n  };\n</script>\n<script src="https://your-app.railway.app/chatbot-widget.js"></script>`}</div>
          </div>
          <div className="card p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Telegram bot integration</p>
            <p className="text-xs text-gray-500 mb-3">Your Telegram bot already handles this. Customers can message it directly.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Bot command</p>
                <p className="text-sm font-mono font-medium">/ask [question]</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Or just message</p>
                <p className="text-sm font-medium">Any text → auto-reply</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
