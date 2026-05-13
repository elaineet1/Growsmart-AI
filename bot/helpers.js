// bot/helpers.js
// Calls the Next.js /api/ai proxy. Bot never touches Anthropic directly.

const axios = require("axios");

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BOT_SECRET = process.env.BOT_API_SECRET;

async function callAI(prompt, module, telegramUserId, maxTokens = 1000) {
  try {
    const res = await axios.post(
      `${APP_URL}/api/ai`,
      { module, prompt, maxTokens, clientId: `tg-${telegramUserId}`, botSecret: BOT_SECRET },
      { timeout: 30000 }
    );
    return res.data.result || "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("[bot/helpers] callAI error:", err.response?.data || err.message);
    return "⚠️ Something went wrong. Please try again in a moment.";
  }
}

module.exports = { callAI };
