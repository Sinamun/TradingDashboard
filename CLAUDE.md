# TradingDashboard — CLAUDE.md

## How This Project Works

This project is managed by **TradeBot** (an OpenClaw orchestrator agent) and built by **you** (Claude Code).

**You are the coding executor.** TradeBot is the orchestrator, planner, product manager, and reviewer. You will receive task cards with clear objectives and acceptance criteria. Your job is to implement them correctly and completely.

### What you do:
- Receive task cards from TradeBot
- Implement features, fixes, and refactors in this repo
- Stay focused on the codebase and technical execution
- Report back what you built, what changed, and any blockers
- Commit frequently with clear messages

### What you don't do:
- Make product decisions — ask if scope is unclear
- Skip acceptance criteria — every task card defines "done"
- Assume your work is complete without checking the criteria
- Refactor unrelated code unless asked to

---

## Project Overview

A personal trading portfolio dashboard for Sina — one user, not a SaaS product. Prioritise clarity, speed, and usefulness over polish. Ship fast, iterate. No premature abstraction.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Database | Neon (serverless Postgres) |
| Hosting | Vercel |
| Repo | [github.com/Pello-Co/TradingDashboard](https://github.com/Pello-Co/TradingDashboard) |

## Core Features

### Portfolio Dashboard
- Overview of all open positions with live/recent prices
- Entry price, current price, P&L (absolute + %), position size
- Colour-coded (green/red) for quick scanning
- Total portfolio value and overall P&L

### Trade Log
- Record new trades: ticker, entry price, size, date, direction (long/short)
- **Source tracking** — who recommended the trade (friend's name)
- Thesis/notes field for each trade
- Close trades with exit price, calculate realised P&L

### Reminders
- Set reminders on specific positions (e.g. "close by March 20")
- Reminders trigger notifications via Telegram bot
- Visual indicator on dashboard for positions with active reminders

### Trade History
- Closed trades archive with full details
- P&L breakdown by source (which friend's picks are performing?)
- Lessons learned field per trade

## Data Model

```sql
trades:
  id, ticker, direction, entry_price, exit_price, size,
  opened_at, closed_at, status (open/closed),
  source (who recommended), thesis, notes

reminders:
  id, trade_id, reminder_date, message, status (pending/sent/dismissed)
```

This is the initial schema. It will evolve — but changes should be backwards-compatible or include migrations.

## Infrastructure

| Service | Account / Detail |
|---------|-----------------|
| GitHub | Pello-Co |
| Vercel | sina-2972 |
| Neon | CLI installed (v2.21.0), auth needs verification |

## Broader System Context

This dashboard is part of a larger setup:

- **TradeBot** (OpenClaw agent) handles daily research, price checks, trade analysis, and Telegram notifications for Sina.
- The dashboard is the **visual layer** — TradeBot is the **intelligence layer**.
- Eventually, TradeBot will read from and write to the same Neon database to keep portfolio state in sync.
- Reminders set in the dashboard should be surfaceable by TradeBot via Telegram.
- The dashboard and TradeBot share the same data model — keep this in mind when making schema decisions.

## Coding Standards

- **TypeScript** — strict mode, no `any` unless truly unavoidable
- **Tailwind CSS** — no custom CSS files unless there's a good reason
- **Next.js App Router** — use server components by default, client components only when needed (interactivity, hooks)
- **Database queries** — use parameterised queries, never string concatenation
- **Error handling** — surface errors clearly in the UI, log them server-side
- **Commits** — small, frequent, with clear messages describing what changed and why
- **No premature abstraction** — keep it simple until complexity demands otherwise
- **Mobile-friendly** — Sina may check this on his phone

## Status Checklist

- [x] Repo created
- [ ] Neon database setup
- [ ] Project scaffolding (Next.js + Tailwind + TypeScript)
- [ ] Core data model + migrations
- [ ] Dashboard UI (portfolio overview)
- [ ] Trade entry form
- [ ] Trade close flow
- [ ] Trade history view
- [ ] P&L by source breakdown
- [ ] Reminder system + Telegram integration
- [ ] Vercel deployment
- [ ] TradeBot ↔ Dashboard data sync

## Decisions Log

| Date | Decision | Context |
|------|----------|---------|
| 2026-03-10 | Repo created as Pello-Co/TradingDashboard | — |
| 2026-03-10 | Trade sources = friends (track by name) | Sina's trade ideas come from friends |
| 2026-03-10 | Reminders via Telegram | Sina's preferred channel |
| 2026-03-10 | Stack: Next.js + Neon + Vercel | Fast to ship, serverless, low maintenance |

## When You're Stuck

- If the task card is ambiguous, say so and ask for clarification rather than guessing
- If you hit a real blocker (auth issue, missing env var, API limit), report it clearly
- If you think the approach in the task card is wrong, explain why and propose an alternative — but don't silently deviate
