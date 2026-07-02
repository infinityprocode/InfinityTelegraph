# App / Agent (demand side)

The consumer that **hires our own miner** — turning the signal into something a person or a bot uses,
and driving the demand that scores our miner (see [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)).

## Run locally

```bash
cd app
cp .env.example .env.local          # set MINER_DIRECT_URL to your running miner
npm install
npm run dev                          # http://localhost:3000
```

Run the miner (`../miner`) first; the app calls it and renders the signal.

## Structure

| Path | What |
|---|---|
| `src/app/page.tsx` | Dashboard — enter an asset, get the signal |
| `src/app/api/signal/route.ts` | Server route → generates demand for our miner |
| `src/lib/telegraph.ts` | Telegraph client. **DIRECT** now; **dispatcher + x402** path is the TODO seam |

## Status
- ✅ Runnable scaffold: UI + server route + Telegraph client (direct path).
- 🔧 Wire the **x402 dispatcher path** (`getSignalViaTelegraph`) once the burner wallet + miner id exist — that's the call that routes real demand to our miner.
- ⏳ Design polish (booh) + real-user features come in Phase 2 (app-track adoption).

## Build in public
Progress is posted from **[@InfinityProCode](https://x.com/InfinityProCode)** on X (every track rewards it).
