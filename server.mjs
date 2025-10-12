// Local Agent Starter – single-file Express server with 5 working agents
// Run locally or deploy anywhere (Vercel/Render/Heroku). Later you can swap in Cloudflare.
// -------------------------------------------------------------
// 1) Save this file as server.js
// 2) `npm init -y && npm i express dotenv node-fetch@3` (Node 18+)
// 3) Create a .env file (see template below)
// 4) `node server.js` then open http://localhost:8787
// -------------------------------------------------------------

import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- CONFIG ----------
const PORT = process.env.PORT || 8787;
// Use Cloudflare AI Gateway (recommended) OR plain OpenAI base URL
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '29752d7d3d78cfaf5c0154ff0d3ee700';
const GATEWAY = process.env.CF_AIG_GATEWAY || 'assistialab';
const BASE_URL = process.env.OPENAI_BASE_URL || `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY}/openai/`;
const PROVIDER_KEY = process.env.OPENAI_API_KEY || 'sk-via-gateway'; // placeholder when BYOK is enabled
const GATEWAY_TOKEN = process.env.CF_AIG_TOKEN || ''; // required if Authenticated Gateway is enabled

// Helper to call Chat Completions (OpenAI-compatible)
async function chat(messages, model = process.env.OPENAI_MODEL || 'gpt-4o-mini', opts = {}) {
  const url = BASE_URL.replace(/\/$/, '') + '/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PROVIDER_KEY}`,
  };
  if (GATEWAY_TOKEN) headers['cf-aig-authorization'] = `Bearer ${GATEWAY_TOKEN}`;

  const body = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.max_tokens ?? 800,
  };

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ---------- SIMPLE FRONT PAGE (manual testing) ----------
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>AssistiaLab – Local Agents</title>
  <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:24px;max-width:900px} textarea,input,select{width:100%;padding:10px;margin:6px 0} .row{display:grid;grid-template-columns:1fr 1fr;gap:12px} button{padding:10px 14px;font-weight:700;border-radius:8px;border:0;background:#111827;color:#fff;cursor:pointer}</style>
  </head><body>
    <h1>AssistiaLab – Local Agents</h1>
    <p>This is a minimal dev server with 5 agents working now. Move to Cloudflare later without changing prompts.</p>

    <h2>1) Content Marketing Plan</h2>
    <form onsubmit="run(event,'/api/content-plan')">
      <div class="row">
        <div><label>Brand</label><input name="brand" placeholder="AssistiaLab"/></div>
        <div><label>Audience</label><input name="audience" placeholder="Marketers in SaaS"/></div>
      </div>
      <label>Topic / Goal</label><input name="topic" placeholder="Launch awareness for App Generator Builder"/>
      <button>Generate Plan</button>
    </form>

    <h2>2) Social Caption</h2>
    <form onsubmit="run(event,'/api/social-caption')">
      <label>Post context</label><textarea name="context" rows="4" placeholder="New feature: one-click deploy for Vercel, Netlify, Render"></textarea>
      <button>Write Captions</button>
    </form>

    <h2>3) Email Reply Assistant</h2>
    <form onsubmit="run(event,'/api/email-reply')">
      <label>Incoming email</label><textarea name="incoming" rows="6" placeholder="Hi, can you share pricing and integration details?"></textarea>
      <button>Draft Reply</button>
    </form>

    <h2>4) Summarizer</h2>
    <form onsubmit="run(event,'/api/summarize')">
      <label>Text</label><textarea name="text" rows="6" placeholder="Paste long text here..."></textarea>
      <button>Summarize</button>
    </form>

    <h2>5) Translator</h2>
    <form onsubmit="run(event,'/api/translate')">
      <div class="row">
        <div><label>Target language (ISO or name)</label><input name="lang" placeholder="French"/></div>
      </div>
      <label>Text</label><textarea name="text" rows="4" placeholder="Hello, welcome to AssistiaLab."></textarea>
      <button>Translate</button>
    </form>

    <pre id="out" style="background:#0b1220;color:#e5e7eb;padding:12px;border-radius:10px;white-space:pre-wrap"></pre>

    <script>
      async function run(e, path){
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch(path, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
        document.getElementById('out').textContent = await res.text();
      }
    </script>
  </body></html>`);
});

// ---------- AGENTS ----------

app.post('/api/content-plan', async (req, res) => {
  try{
    const { brand = 'AssistiaLab', audience = 'marketers', topic = 'product launch' } = req.body || {};
    const messages = [
      { role: 'system', content: 'You are a senior content strategist. Output concise JSON with fields: objectives[], ideas[], calendar[] (date,title,channel,cta).' },
      { role: 'user', content: `Brand: ${brand}\nAudience: ${audience}\nGoal/Topic: ${topic}\nConstraints: 2-week calendar, 3 channels (Blog, LinkedIn, X). Include CTAs with UTM placeholders.` }
    ];
    const out = await chat(messages, undefined, { max_tokens: 1200 });
    res.type('application/json').send(out);
  }catch(e){ res.status(500).json({ error: String(e.message || e) }); }
});

app.post('/api/social-caption', async (req, res) => {
  try{
    const { context = '' } = req.body || {};
    const messages = [
      { role: 'system', content: 'You write punchy social captions. Output JSON: captions:[{network, text, hashtags}] with 2 for LinkedIn and 2 for X.' },
      { role: 'user', content: context }
    ];
    const out = await chat(messages, undefined, { max_tokens: 600 });
    res.type('application/json').send(out);
  }catch(e){ res.status(500).json({ error: String(e.message || e) }); }
});

app.post('/api/email-reply', async (req, res) => {
  try{
    const { incoming = '' } = req.body || {};
    const messages = [
      { role: 'system', content: 'You are a helpful SaaS sales assistant. Draft a reply in polite, concise tone. Add 3 bullet points and a CTA link. Output markdown.' },
      { role: 'user', content: incoming }
    ];
    const out = await chat(messages, undefined, { max_tokens: 700 });
    res.type('text/markdown').send(out);
  }catch(e){ res.status(500).json({ error: String(e.message || e) }); }
});

app.post('/api/summarize', async (req, res) => {
  try{
    const { text = '' } = req.body || {};
    const messages = [
      { role: 'system', content: 'Summarize clearly in bullet points, then 1-sentence tl;dr. Output markdown.' },
      { role: 'user', content: text }
    ];
    const out = await chat(messages, undefined, { max_tokens: 600 });
    res.type('text/markdown').send(out);
  }catch(e){ res.status(500).json({ error: String(e.message || e) }); }
});

app.post('/api/translate', async (req, res) => {
  try{
    const { text = '', lang = 'French' } = req.body || {};
    const messages = [
      { role: 'system', content: 'Translate accurately, keep meaning and tone. Output only the translation, no preface.' },
      { role: 'user', content: `Target: ${lang}\nText: ${text}` }
    ];
    const out = await chat(messages, undefined, { max_tokens: 600, temperature: 0.2 });
    res.type('text/plain').send(out);
  }catch(e){ res.status(500).json({ error: String(e.message || e) }); }
});

// Health
app.get('/healthz', (req,res)=>res.json({ ok:true, service:'assistialab-local-agents'}));

app.listen(PORT, () => {
  console.log(`Local agents running at http://localhost:${PORT}`);
  console.log(`Using base URL: ${BASE_URL}`);
});

/* ----------------- .env template -----------------
# Use your real values here
PORT=8787
CF_ACCOUNT_ID=29752d7d3d78cfaf5c0154ff0d3ee700
CF_AIG_GATEWAY=assistialab
CF_AIG_TOKEN=REPLACE_WITH_YOUR_GATEWAY_AUTH_TOKEN
OPENAI_API_KEY=sk-via-gateway
# If you want to bypass the gateway for local testing, uncomment:
# OPENAI_BASE_URL=https://api.openai.com/v1
# And set OPENAI_API_KEY to your real OpenAI key.
--------------------------------------------------- */
