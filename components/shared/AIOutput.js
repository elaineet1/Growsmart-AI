"use client";
import { useState } from "react";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";

export default function AIOutput({ result, loading, error, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center gap-3">
      <Loader2 size={18} className="text-teal-500 animate-spin flex-shrink-0" />
      <p className="text-sm text-gray-500">AI is working on it...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm text-red-600 font-medium">Something went wrong</p>
      <p className="text-xs text-red-400 mt-1">{error}</p>
    </div>
  );

  if (!result) return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
      <p className="text-sm text-gray-400">Your AI output will appear here</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">AI Output</span>
        </div>
        <div className="flex gap-2">
          {onRegenerate && (
            <button onClick={onRegenerate} className="btn-secondary text-xs py-1 px-2.5">
              <RefreshCw size={12} /> Try again
            </button>
          )}
          <button onClick={copy} className="btn-secondary text-xs py-1 px-2.5">
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="output-box">{result}</div>
    </div>
  );
}
