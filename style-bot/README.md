# Style Bot — AI Clothing Store Assistant (Portfolio Project)

A chatbot that answers questions about a small clothing catalog using
Google's Gemini API. Built as a standalone demo — no real website required.

## Architecture

```
React chat widget  --POST /chat-->  Express backend  --API call-->  Gemini
                                          |
                                    products.json
                                    (in-prompt catalog)
```

For a catalog this size (10 items), the whole catalog is passed directly
in the system prompt. If you scale to hundreds of products, the next step
is retrieval-augmented generation (RAG): embed each product description,
store the vectors, and only retrieve the top few matches per question
instead of sending the whole catalog every time.

## Project structure

```
style-bot/
  backend/
    server.js         # Express server, calls Gemini
    products.json      # Product catalog
    package.json
    .env.example        # Copy to .env and add your real key
    .gitignore
  frontend/
    ChatWidget.jsx      # React chat component
```

## Setup — Backend

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
4. Open `.env` and paste your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
5. Start the server:
   ```
   npm start
   ```
   You should see: `Style-bot backend listening on http://localhost:3001`

**Never commit your `.env` file.** It's already in `.gitignore`.

## Setup — Frontend

`ChatWidget.jsx` is a plain React component with inline styles (no CSS
framework needed). Drop it into any React app created with Vite or
Create React App:

1. Create a React app if you don't have one yet, e.g.:
   ```
   npm create vite@latest style-bot-frontend -- --template react
   cd style-bot-frontend
   npm install
   ```
2. Copy `ChatWidget.jsx` into `src/`.
3. Import and render it in `App.jsx`:
   ```jsx
   import ChatWidget from "./ChatWidget";

   function App() {
     return (
       <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
         <ChatWidget />
       </div>
     );
   }

   export default App;
   ```
4. Run it:
   ```
   npm run dev
   ```

With the backend running on port 3001 and the frontend on its own dev
port (usually 5173), the widget will talk to your local backend.

## Customizing the catalog

Edit `backend/products.json` — add, remove, or change items. No code
changes needed elsewhere; the server reads it fresh each time it starts.

## Deploying for free

- **Frontend** → Vercel or Netlify (connect your GitHub repo, auto-deploys
  on push).
- **Backend** → Render or Railway free tier. Set the `GEMINI_API_KEY`
  environment variable in their dashboard (not in a committed `.env`
  file).
- Once deployed, update `BACKEND_URL` in `ChatWidget.jsx` to your live
  backend URL instead of `localhost:3001`.

## Notes for your portfolio writeup

- Mention *why* you stuffed the catalog into the prompt vs. using RAG,
  and that RAG is the natural next step at scale — this shows you
  understand the tradeoff, not just that you called an API.
- Mention the free-tier constraints you worked within (Gemini rate
  limits, Render free-tier cold starts) — shows real-world engineering
  awareness.
