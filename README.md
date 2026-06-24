# Portfolio Backend

Express + MongoDB API that powers the contact form on [Prajwal Reddy's portfolio](../client). It saves every submission to MongoDB and emails a notification via Resend.

## Tech Stack

- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Resend (email API over HTTPS — see "Why Resend, not Gmail SMTP" below)
- CORS (origin-restricted via env var)

## Project Structure

```
backend/
├── index.js              # App entry point, middleware, server start
├── routes/
│   └── contact.js        # POST /api/contact — validates, saves, emails
├── models/
│   └── Contact.js        # Mongoose schema for contact submissions
├── .env                  # Local secrets (never committed)
└── .env.example          # Template showing required variables
```

## Setup

```bash
cd backend
npm install
```

Create a `.env` file in this folder (copy `.env.example` and fill in real values):

```
MONGO_URI=your-mongodb-connection-string
RESEND_API_KEY=your-resend-api-key
EMAIL_USER=your-own-email-address
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,https://your-actual-vercel-url.vercel.app
```

**Getting a Resend API key:** sign up at [resend.com](https://resend.com) → **API Keys** → **Create API Key** (Sending access is enough). `EMAIL_USER` is just the inbox that receives contact form notifications — it can be any address you check, e.g. your Gmail. Without a verified custom domain, emails send from Resend's shared `onboarding@resend.dev` address, which works fine for a personal contact form notification — no DNS setup required.

### Why Resend, not Gmail SMTP

This project originally used Nodemailer over Gmail's SMTP. As of September 2025, Render blocks outbound SMTP traffic (ports 25, 465, 587) on free web services to fight spam abuse, so Gmail SMTP times out (`ETIMEDOUT`) once deployed there — even though it works fine locally. Resend sends over HTTPS instead of SMTP, which isn't blocked, so it works identically in local dev and on Render's free tier.

## Running locally

```bash
npm run dev      # nodemon, auto-restarts on file changes
# or
npm start        # plain node, no auto-restart
```

The server starts on `http://localhost:5000`. Visit it directly in a browser — you should see:

```json
{ "status": "ok", "message": "Portfolio backend is running" }
```

The frontend (running separately on port 5173) must be running at the same time for the contact form to work locally.

## API

### `POST /api/contact`

**Body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "message": "Hello!" }
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | Saved to MongoDB and emailed successfully |
| 400 | Missing a required field |
| 403 | Request came from an origin not in `ALLOWED_ORIGINS` |
| 500 | Database, email, or server misconfiguration — check server logs |

## Deployment (Render)

1. Push this folder to its own GitHub repo (or point Render at the `backend` subfolder of a monorepo).
2. On [render.com](https://render.com) → **New → Web Service** → connect the repo.
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables in the Render dashboard (**Environment** tab): `MONGO_URI`, `RESEND_API_KEY`, `EMAIL_USER`. Leave `ALLOWED_ORIGINS` until you have your final Vercel URL.
5. Once both services are live, set `ALLOWED_ORIGINS` to your **production** Vercel domain (not a preview-deploy URL) plus `http://localhost:5173` for local testing, comma-separated, no spaces.
6. MongoDB Atlas → **Network Access** → allow `0.0.0.0/0`, since Render uses dynamic IPs.

### Notes on Render's free tier

Free services spin down after 15 minutes of inactivity. The first request after idling can take 30–50 seconds while it wakes up — this is normal, not a bug.

## Security

- `.env` is gitignored — never commit real credentials. If credentials are ever accidentally pushed, rotate them immediately (new MongoDB password, new Resend API key — delete the old one in the Resend dashboard and create a fresh one).
- CORS is locked to the origins listed in `ALLOWED_ORIGINS`; update this every time your frontend URL changes.
