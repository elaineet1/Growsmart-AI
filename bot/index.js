// bot/index.js — GrowSmart AI Telegram Bot
require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });

const { Telegraf } = require("telegraf");
const { callAI }   = require("./helpers");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ── START / HELP ─────────────────────────────────────────
bot.start(ctx => ctx.reply(
  `👋 Welcome to *GrowSmart AI*\n\nYour AI revenue team for Singapore SMEs.\n\n` +
  `*Content*\n/post [topic] — LinkedIn post\n/email [prospect] — Cold email\n/proposal [brief] — Proposal\n/repurpose [text] — 3 formats\n\n` +
  `*Leads*\n/leads [industry] — Find SG leads\n/outreach [prospect] — Write opener\n\n` +
  `*Operations*\n/notes [meeting notes] — Summarise & action items\n/doc [document text] — Process document\n\n` +
  `*Customer service*\n/ask [question] — FAQ chatbot\n\nOr just type any question and I'll answer!`,
  { parse_mode: "Markdown" }
));

bot.help(ctx => ctx.reply(
  `*GrowSmart AI Commands*\n\n` +
  `/post [topic]\n/email [prospect]\n/proposal [brief]\n/repurpose [text]\n` +
  `/leads [industry]\n/outreach [details]\n/notes [notes]\n/doc [text]\n/ask [question]`,
  { parse_mode: "Markdown" }
));

// ── CONTENT ───────────────────────────────────────────────
bot.command("post", async ctx => {
  const topic = ctx.message.text.replace(/^\/post\s*/i, "").trim() || "How AI saves Singapore SMEs time and money";
  await ctx.reply("✍️ Writing your LinkedIn post...");
  const result = await callAI(
    `Write a LinkedIn post for a Singapore professional services SME.\nTopic: ${topic}\n150-200 words. Punchy opener, 3 value points, soft CTA. Max 3 hashtags.\nOutput only the post.`,
    "content", ctx.from.id
  );
  await ctx.reply(result);
});

bot.command("email", async ctx => {
  const prospect = ctx.message.text.replace(/^\/email\s*/i, "").trim() || "a Singapore SME decision maker";
  await ctx.reply("✉️ Writing your cold email...");
  const result = await callAI(
    `Write a cold outreach email for: ${prospect}\nFor a Singapore AI consultancy. 100-130 words. Include subject line. Personal feel. Single CTA.\nOutput only the email.`,
    "content", ctx.from.id
  );
  await ctx.reply(result);
});

bot.command("proposal", async ctx => {
  const brief = ctx.message.text.replace(/^\/proposal\s*/i, "").trim();
  if (!brief) return ctx.reply("Usage: /proposal [client name and what they need]");
  await ctx.reply("📄 Writing your proposal...");
  const result = await callAI(
    `Write a professional B2B proposal for a Singapore SME client.\nBrief: ${brief}\nInclude: Executive Summary, Scope, Deliverables, Timeline, Investment (placeholder), Next Steps. Singapore professional tone.`,
    "proposal", ctx.from.id, 1500
  );
  // Split long proposals
  for (let i = 0; i < result.length; i += 4000) {
    await ctx.reply(result.slice(i, i + 4000));
  }
});

bot.command("repurpose", async ctx => {
  const content = ctx.message.text.replace(/^\/repurpose\s*/i, "").trim();
  if (!content) return ctx.reply("Usage: /repurpose [your content to repurpose]");
  await ctx.reply("🔄 Repurposing into 3 formats...");
  const result = await callAI(
    `Repurpose this for a Singapore SME:\n\n${content}\n\nFORMAT 1 — LinkedIn Post (150 words, 3 hashtags):\nFORMAT 2 — WhatsApp Broadcast (70 words, CTA):\nFORMAT 3 — Email Subject + Preview (subject max 50 chars, preview max 90 chars):`,
    "content", ctx.from.id
  );
  await ctx.reply(result);
});

// ── LEADS ────────────────────────────────────────────────
bot.command("leads", async ctx => {
  const industry = ctx.message.text.replace(/^\/leads\s*/i, "").trim() || "professional services";
  await ctx.reply(`🔍 Finding ${industry} leads in Singapore...`);
  const result = await callAI(
    `Generate 3 realistic Singapore SME lead profiles for ${industry}.\nFor each: Company name, Contact name & role, SG district, one specific trigger (why they need AI now), ICP score 70-95.\nFormat as a clean list — no JSON.`,
    "leads", ctx.from.id
  );
  await ctx.reply(result);
});

bot.command("outreach", async ctx => {
  const details = ctx.message.text.replace(/^\/outreach\s*/i, "").trim();
  if (!details) return ctx.reply("Usage: /outreach [company, role, and any context]");
  await ctx.reply("✍️ Writing personalised outreach...");
  const result = await callAI(
    `Write a personalised LinkedIn first-touch message (max 300 chars) for:\n${details}\nFor a Singapore AI consultancy. Feel personal, reference their context, low-pressure CTA. Output only the message.`,
    "content", ctx.from.id
  );
  await ctx.reply(result);
});

// ── OPS ───────────────────────────────────────────────────
bot.command("notes", async ctx => {
  const raw = ctx.message.text.replace(/^\/notes\s*/i, "").trim();
  if (!raw) return ctx.reply("Usage: /notes [paste your meeting notes]");
  await ctx.reply("📋 Processing your meeting notes...");
  const result = await callAI(
    `Process these meeting notes:\n\n${raw}\n\nOutput:\nSUMMARY (2-3 sentences)\n\nDECISIONS\n-\n\nACTION ITEMS (task | owner | due)\n-\n\nFOLLOW-UP\n-`,
    "ops", ctx.from.id
  );
  await ctx.reply(result);
});

bot.command("doc", async ctx => {
  const docText = ctx.message.text.replace(/^\/doc\s*/i, "").trim();
  if (!docText) return ctx.reply("Usage: /doc [paste document text]");
  await ctx.reply("🔍 Analysing document...");
  const result = await callAI(
    `Analyse this business document for a Singapore SME:\n\n${docText}\n\nExtract:\nKEY INFORMATION\nACTION ITEMS\nRED FLAGS\nSUMMARY`,
    "ops", ctx.from.id
  );
  await ctx.reply(result);
});

// ── CHATBOT (catch-all) ───────────────────────────────────
bot.command("ask", async ctx => {
  const question = ctx.message.text.replace(/^\/ask\s*/i, "").trim();
  if (!question) return ctx.reply("Usage: /ask [customer question]");
  const result = await callAI(question, "chatbot", ctx.from.id);
  await ctx.reply(result);
});

bot.on("text", async ctx => {
  if (ctx.message.text.startsWith("/")) return;
  const result = await callAI(ctx.message.text, "chatbot", ctx.from.id);
  await ctx.reply(result);
});

// ── LAUNCH ────────────────────────────────────────────────
const WEBHOOK = process.env.TELEGRAM_WEBHOOK_URL;

if (WEBHOOK) {
  bot.launch({ webhook: { domain: WEBHOOK, port: process.env.PORT || 3001 } });
  console.log("✅ Bot running via webhook:", WEBHOOK);
} else {
  bot.launch();
  console.log("✅ Bot running via polling (dev mode)");
}

process.once("SIGINT",  () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
