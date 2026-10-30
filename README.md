# ♚ Chess Arena — Real-Time Multiplayer Chess

A premium, production-ready multiplayer chess platform built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. Features real-time gameplay, matchmaking, friends system, and a world-class dark UI.

---

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a **free** project
2. Wait for the project to finish provisioning
3. Navigate to **SQL Editor** (left sidebar)
4. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
5. Paste into the SQL Editor and click **Run**
6. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Enable Realtime

In the Supabase Dashboard:

1. Go to **Database → Replication**
2. Enable replication for these tables: `games`, `game_moves`, `game_invites`, `matchmaking_queue`, `friendships`, `profiles`

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🌐 Deploy to Vercel (Free — Runs 24/7)

### One-Click Deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
3. Import your GitHub repository
4. Add the **Environment Variables** from your `.env.local`
5. Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain (e.g., `https://chess-arena.vercel.app`)
6. Click **Deploy**

Your chess platform is now live 24/7 on Vercel's free tier! ♟️

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Chess Engine | chess.js |
| Board UI | react-chessboard |
| Icons | Lucide React |
| Toasts | Sonner |
| Hosting | Vercel (free tier) |

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with auth provider
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── login/page.tsx      # Login page
│   ├── signup/page.tsx     # Signup page
│   ├── dashboard/page.tsx  # Main lobby & matchmaking
│   ├── game/[id]/page.tsx  # Live game page
│   ├── friends/page.tsx    # Friends management
│   └── profile/page.tsx    # User profile
├── components/
│   ├── ChessBoard.tsx      # Premium chessboard
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Creator remark footer
│   ├── FriendsList.tsx     # Friends list sidebar
│   ├── OnlinePlayers.tsx   # Online players list
│   ├── GameInvite.tsx      # Game invite notifications
│   ├── MatchmakingModal.tsx # Matchmaking UI
│   ├── GameOverModal.tsx   # Game result modal
│   └── ProfileSetup.tsx    # Profile edit form
├── context/
│   └── AuthContext.tsx     # Auth context provider
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── useGame.ts          # Game state & realtime hook
│   ├── useFriends.ts       # Friends system hook
│   └── usePresence.ts      # Online presence hook
├── lib/
│   ├── supabase.ts         # Browser Supabase client
│   ├── supabase-server.ts  # Server Supabase client
│   └── chess-engine.ts     # Chess logic utilities
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## ✨ Features

- **Secure Authentication** — Email/password signup & login with Supabase Auth
- **Real-Time Matchmaking** — Instant pairing with race-condition-safe DB functions
- **Live Multiplayer Chess** — Moves sync in real-time via Supabase Realtime
- **Complete Rules Engine** — Full chess validation (check, checkmate, stalemate, en passant, castling, promotion)
- **Friends System** — Search players, send requests, challenge friends directly
- **Online Presence** — See who's online in real-time
- **Premium UI** — Dark theme, smooth animations, responsive design

---

*Built by Mohammad Tahsin Sr.*
