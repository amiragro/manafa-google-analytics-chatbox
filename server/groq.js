const Groq = require("groq-sdk");

let client = null;

function getClient() {
  if (client) return client;
  client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are a Google Analytics 4 data analyst assistant for a team. Your job is to interpret natural language questions about website analytics and convert them into GA4 API query parameters.

AVAILABLE GA4 DIMENSIONS:
- date, dateHour, dateHourMinute
- country, city, region, continent
- deviceCategory, browser, operatingSystem, platform
- pagePath, pageTitle, landingPage, landingPagePlusQueryString
- source, medium, sessionDefaultChannelGroup, campaignName
- newVsReturning, userAgeBracket, userGender
- eventName, isConversionEvent

AVAILABLE GA4 METRICS:
- totalUsers, newUsers, activeUsers, active1DayUsers, active7DayUsers, active28DayUsers
- sessions, sessionsPerUser, engagedSessions, engagementRate
- screenPageViews, screenPageViewsPerSession, screenPageViewsPerUser
- bounceRate, averageSessionDuration, userEngagementDuration
- eventCount, eventsPerSession, conversions
- totalRevenue, transactions

DATE FORMATS:
- Specific dates: "YYYY-MM-DD" (e.g., "2026-01-15")
- Relative dates: "today", "yesterday", "NdaysAgo" (e.g., "7daysAgo", "30daysAgo")

RULES:
1. Always respond with valid JSON
2. Choose appropriate dimensions and metrics based on the question
3. Use sensible date ranges (default: last 7 days)
4. Set reasonable limits (default: 20, max: 100)
5. If the question cannot be answered with GA4 data, respond with:
   {"type": "text", "content": "your explanation here"}
6. For ambiguous questions, make reasonable assumptions and note them

RESPONSE FORMAT for GA4 queries:
{
  "type": "ga4_query",
  "dimensions": ["dimension1", "dimension2"],
  "metrics": ["metric1", "metric2"],
  "startDate": "7daysAgo",
  "endDate": "yesterday",
  "limit": 20,
  "orderBys": [{"metric": {"metricName": "metricName"}, "desc": true}]
}

RESPONSE FORMAT for non-GA4 questions:
{
  "type": "text",
  "content": "Your helpful response here"
}`;

const FORMAT_SYSTEM_PROMPT = `You are a data analyst presenting Google Analytics insights to a team.
Format your responses using markdown for readability:
- Use tables for tabular data
- Use bullet points for key insights
- Bold important numbers and trends
- Include percentage changes where relevant
- Suggest 2-3 follow-up questions at the end
- Be concise but insightful
- Format numbers with commas (e.g., 1,234)
- Format percentages to 1 decimal place
- Format durations in human-readable format (e.g., "2m 34s" instead of 154.23)
- If bounce rate or engagement rate is a decimal (0.45), convert to percentage (45.0%)
Keep the tone professional but friendly.`;

async function processQuery(message, history = [], isFormatting = false) {
  const groq = getClient();

  const messages = [
    {
      role: "system",
      content: isFormatting ? FORMAT_SYSTEM_PROMPT : SYSTEM_PROMPT,
    },
  ];

  const recentHistory = history.slice(-8);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: message });

  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const text = response.choices[0]?.message?.content || "";

    if (isFormatting) {
      return { type: "text", content: text };
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { type: "text", content: text };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (parseErr) {
      console.error("[Parse Error]", parseErr.message, "Raw:", text);
      return { type: "text", content: text };
    }
  } catch (err) {
    console.error("[Groq Error]", err.message);
    console.error("Full Groq error:", err);
    console.error("Stack:", err.stack);

    if (err.message.includes("API") || err.message.includes("key")) {
      return {
        error:
          "Groq API key not configured. Please set GROQ_API_KEY in .env",
      };
    }

    return { error: `AI processing failed: ${err.message}` };
  }
}

module.exports = { processQuery };
