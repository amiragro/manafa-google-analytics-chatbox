# 📊 GA4 Team Chat

> Ask questions about your Google Analytics data in plain English. Get instant insights powered by Claude AI.

![Node](https://img.shields.io/badge/Node.js-18+-green)
![Vue](https://img.shields.io/badge/Vue-3-blue)
![Claude](https://img.shields.io/badge/Claude_AI-Sonnet-purple)
![GA4](https://img.shields.io/badge/Google_Analytics-4-orange)

---

## 🎯 What Is This?

A self-hosted chat application where your team can query Google Analytics data using natural language. No GA4 expertise needed — just ask a question and get formatted insights.

**Examples:**
- "Show me active users for the last 7 days"
- "What are the top 10 pages by views this month?"
- "Compare mobile vs desktop traffic"
- "Which traffic sources bring the most engaged users?"

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────┐
│                  Browser (Vue 3)                  │
│          Team member types a question             │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│              Express.js Server                    │
│                                                   │
│  1. Receives natural language query               │
│  2. Sends to Claude AI for interpretation         │
│  3. Claude returns GA4 API parameters             │
│  4. Server queries Google Analytics               │
│  5. Sends raw data back to Claude for formatting  │
│  6. Returns formatted insights to browser         │
└──────┬───────────────────┬───────────────────────┘
       │                   │
       ▼                   ▼
┌──────────────┐   ┌──────────────┐
│  Claude API  │   │   GA4 API    │
│  (Anthropic) │   │  (Google)    │
└──────────────┘   └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Analytics 4 property with service account access
- Anthropic API key

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ga4-team-chat
npm install
```

### 2. Setup Credentials

```bash
# Create credentials directory
mkdir credentials

# Copy your GA service account JSON key
cp /path/to/your-service-account-key.json credentials/ga-credentials.json
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
GOOGLE_APPLICATION_CREDENTIALS=./credentials/ga-credentials.json
GA4_PROPERTY_ID=404714744
ANTHROPIC_API_KEY=sk-ant-your-key-here
TEAM_ACCESS_TOKEN=your-secure-team-token
```

### 4. Run

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Open **http://localhost:3000** — done! 🎉

---

## 🐳 Docker Deployment (Recommended for Teams)

### Quick Deploy

```bash
# Place your credentials
mkdir credentials
cp /path/to/ga-credentials.json credentials/

# Set environment
cp .env.example .env
# Edit .env with your values

# Build & run
docker-compose up -d
```

The app is now running on **http://your-server:3000**

### Deploy to a Server

```bash
# On your server
git clone <repo-url>
cd ga4-team-chat

mkdir credentials
# Transfer ga-credentials.json to credentials/

cp .env.example .env
nano .env  # Configure all values

docker-compose up -d --build
```

---

## 🔐 Security

### Team Access Token

Set `TEAM_ACCESS_TOKEN` in `.env` to require authentication. Share this token with your team — they'll enter it once in the browser.

```env
TEAM_ACCESS_TOKEN=invocod-ga4-2026-secure
```

If left empty, the app is open access (suitable for internal networks only).

### Rate Limiting

Built-in rate limiting: 30 requests per minute per IP.

### Service Account

The GA4 service account has **read-only** access (Viewer role). It cannot modify your analytics data.

### API Key

The Anthropic API key stays on the server. It is never exposed to the browser.

---

## 📋 Team Setup Guide

### For the Admin (you)

1. Set up the repository and server
2. Deploy with Docker or directly with Node.js
3. Share with the team:
   - The **URL** (e.g., `http://analytics.invocod.internal:3000`)
   - The **access token** (via secure vault or DM)

### For Team Members

1. Open the URL in your browser
2. Enter the access token (one time)
3. Start asking questions!

**That's it. No installation required.**

---

## 💡 Example Queries

| Category | Query |
|---|---|
| **Traffic** | "Show me daily active users for the past month" |
| **Pages** | "What are the top 20 pages by pageviews?" |
| **Bounce** | "Which pages have the highest bounce rate?" |
| **Sources** | "Where is our traffic coming from?" |
| **Geography** | "Show users by country for Saudi Arabia" |
| **Devices** | "What percentage of users are on mobile?" |
| **Trends** | "Compare this week vs last week traffic" |
| **Engagement** | "What's the average session duration by channel?" |
| **New Users** | "How many new users did we get this month?" |
| **Landing Pages** | "What are the top landing pages?" |

---

## 🔧 API Endpoints

For advanced users or integrations:

### `POST /api/chat`
Natural language query → formatted response.

```json
{
  "message": "Show me active users for the last 7 days",
  "history": []
}
```

### `POST /api/query`
Direct GA4 query (for programmatic access).

```json
{
  "dimensions": ["date"],
  "metrics": ["totalUsers", "sessions"],
  "startDate": "7daysAgo",
  "endDate": "yesterday",
  "limit": 30
}
```

### `GET /api/schema`
Returns available metrics, dimensions, and example queries.

### `GET /api/health`
Server health check.

---

## 🗂 Project Structure

```
ga4-team-chat/
├── server/
│   ├── index.js       # Express server & routes
│   ├── ga4.js         # Google Analytics Data API wrapper
│   └── claude.js      # Claude AI integration (NLP → GA4 params)
├── public/
│   └── index.html     # Vue 3 SPA (chat interface)
├── credentials/       # GA service account key (git-ignored)
├── .env               # Environment config (git-ignored)
├── .env.example       # Template for environment config
├── Dockerfile         # Container build
├── docker-compose.yml # One-command deployment
├── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Configuration

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅ | Path to GA service account JSON key |
| `GA4_PROPERTY_ID` | ✅ | Your GA4 property ID (numeric) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key from Anthropic |
| `CLAUDE_MODEL` | ❌ | Claude model (default: `claude-sonnet-4-20250514`) |
| `TEAM_ACCESS_TOKEN` | ❌ | Auth token for team access |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | `production` or `development` |

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| "Permission denied" on GA4 | Add service account email in GA4 Admin → Access Management |
| "Invalid property ID" | Use numeric ID only (e.g., `404714744`) |
| "Claude API key invalid" | Check `ANTHROPIC_API_KEY` in `.env` |
| "Cannot find credentials" | Check file path in `GOOGLE_APPLICATION_CREDENTIALS` |
| Slow responses | Claude + GA4 = ~3-8 seconds per query. This is normal. |
| Rate limit errors | Wait 60 seconds or increase limit in `server/index.js` |

---

## 📄 License

Internal use — INVOCOD Technologies
