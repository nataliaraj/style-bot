# Style Bot — AI Clothing Store Assistant

A chatbot that answers questions about a small clothing catalog using
Google's Gemini API. Built as a standalone demo — no real website
right now. Can be inserted into any website.

**Live demo:** https://style-bot-flax.vercel.app

**Source:** https://github.com/nataliaraj/style-bot

**Stack:** React, Node/Express, Gemini API · Deployed on Vercel + Render

## The problem

Most "add AI chat to your site" tutorials wire up a raw LLM call and
stop there — which means the bot will happily invent a product,
price, or size that doesn't exist. For a retail use case, that's a
real trust problem. The goal here was a chatbot that only talks about
what's actually in stock.

## Architecture

```
React chat widget --> Express backend --> Gemini API
                            |
                      products.json (10-item catalog)
```

The backend injects the full product catalog into the system prompt
on every request, along with an explicit instruction not to invent
items outside it. For a catalog this size, that's the simplest
approach that works reliably.

## Why not RAG (yet)

At scale — hundreds or thousands of products — stuffing the whole
catalog into every prompt stops being practical: it's slower, more
expensive per call, and eventually exceeds context limits. The
standard fix is retrieval-augmented generation (RAG): embed each
product description as a vector, store it in a vector database, and
retrieve only the handful of products relevant to a given question
before calling the LLM. I scoped this version to prompt-stuffing
deliberately, since the catalog is small, but the architecture is
built to swap in a retrieval step later without touching the frontend
or the API contract — the backend's `/chat` endpoint doesn't care
where the product context comes from.

## Real-world constraints worked within

- **Zero budget:** Gemini's free tier, Vercel's free tier, Render's
  free tier. No credit card, no paid infrastructure.
- **Free-tier cold starts:** Render's free web services spin down
  after 15 minutes of inactivity, so the first request after idle
  time can take 30-50 seconds. This is a real tradeoff of running on
  a $0 budget, and one I'd flag to a team before shipping something
  similar in production — a paid always-on instance (or a periodic
  keep-alive ping) is the fix.
- **Model deprecation mid-build:** Google retired the model I
  originally built against partway through, returning a 404 with the
  replacement model ID in the error message. Fixed by reading the
  error and swapping the model string — a small thing, but a good
  reminder that LLM API integrations need to tolerate upstream model
  churn.

## What I'd do differently at scale

1. Move to RAG once the catalog grows past ~50-100 items.
2. Add conversation memory/session handling so the bot remembers
   earlier turns across page reloads, not just within one browser
   session.
3. Add basic analytics (which questions get asked most, where the
   bot says "we don't carry that") to inform actual inventory or FAQ
   decisions — the kind of feedback loop that makes this useful
   beyond a demo.

## Running it locally

### Backend
```
cd backend
npm install
cp .env.example .env
# add your GEMINI_API_KEY to .env
npm start
```
Runs on `http://localhost:3001`.

### Frontend
```
cd style-bot-frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Update `BACKEND_URL` in
`src/ChatWidget.jsx` to point at your local backend or a deployed one.

## Customizing the catalog

Edit `backend/products.json` — add, remove, or change items. No code
changes needed elsewhere.
