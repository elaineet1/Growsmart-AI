// app/api/ai/route.js
// THE KEY FILE — all AI calls go through here. API key never leaves the server.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { askClaude, SYSTEM_PROMPTS } from "@/lib/claude";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { module, prompt, systemOverride, maxTokens, clientId, botSecret } = body;

    // ── Auth: web session OR bot secret ─────────────────
    const isBotCall = botSecret && botSecret === process.env.BOT_API_SECRET;
    const session   = isBotCall ? null : await getServerSession(authOptions).catch(() => null);

    if (!isBotCall && !session) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // ── Validate prompt ──────────────────────────────────
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.length > 8000) {
      return NextResponse.json({ error: "Prompt too long (max 8000 chars)" }, { status: 400 });
    }

    // ── Call Claude ──────────────────────────────────────
    const systemPrompt = systemOverride || SYSTEM_PROMPTS[module] || SYSTEM_PROMPTS.default;
    const result       = await askClaude(prompt, systemPrompt, maxTokens || 1000);

    // ── Log usage (non-blocking) ─────────────────────────
    const userId = session?.user?.id || clientId || "bot";
    db.usageLog.create({
      data: {
        userId,
        module:         module || "unknown",
        promptLength:   prompt.length,
        responseLength: result.length,
      },
    }).catch(() => {}); // swallow — don't fail the request if logging fails

    return NextResponse.json({ result });

  } catch (err) {
    console.error("[/api/ai]", err.message);
    return NextResponse.json({ error: err.message || "AI request failed" }, { status: 500 });
  }
}
