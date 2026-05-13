// lib/claude.js

export async function askClaude(userPrompt, systemPrompt, maxTokens = 1000) {
  // Lazy import — only runs at request time, not build time
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt || SYSTEM_PROMPTS.default },
      { role: "user",   content: userPrompt },
    ],
  });
  return response.choices[0].message.content;
}

export const SYSTEM_PROMPTS = {
  default:
    "You are a helpful AI assistant for Singapore SMEs. Be concise, practical, and locally relevant.",
  content: `You are a Singapore B2B content expert writing for SMEs. Be sharp, locally relevant, and practical. Reference Singapore context naturally (MAS, SkillsFuture, GST, grants like PSG/EDG where relevant). No generic corporate fluff. No hashtag spam. Output only the content requested.`,
  proposal: `You are a professional proposal writer for Singapore B2B professional services firms. Write clear, structured proposals. Structure: Executive Summary, Understanding of Needs, Scope of Work, Deliverables & Timeline, Investment, Next Steps. Singapore professional tone.`,
  leads: `You are a B2B lead generation expert for Singapore SMEs. Generate realistic Singapore company profiles with local context. Use real Singapore districts and realistic company names. Return ONLY valid JSON when asked — no markdown, no explanation.`,
  chatbot: `You are a helpful customer service AI for a Singapore SME. Answer questions based on the provided FAQ. Be friendly and concise (under 150 words). If you don't know, offer to connect them with a human.`,
  ops: `You are a business operations assistant for Singapore SMEs. Extract key information from documents, flag issues, and summarise clearly. Flag any Singapore compliance considerations (GST, MOM, PDPA) where relevant.`,
};