"use client";
// lib/useAI.js
// Shared hook used by all module pages to call /api/ai

import { useState } from "react";

export function useAI(module) {
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function generate(prompt, options = {}) {
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, prompt, ...options }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.result);
      return data.result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  function clear() { setResult(""); setError(null); }

  return { result, loading, error, generate, clear };
}
