# Portfolio Backend

Express + MongoDB API that powers the contact form on [Prajwal Reddy's portfolio](../client). It saves every submission to MongoDB and emails a copy via Gmail.

## Tech Stack

- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Nodemailer (Gmail SMTP)
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
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,https://your-actual-vercel-url.vercel.app
```

**Getting a Gmail app password:** Gmail will reject your normal password from Nodemailer. Enable 2-Step Verification on your Google account, then generate an **App Password** at https://myaccount.google.com/apppasswords and use that as `EMAIL_PASS`. If 2-Step Verification is ever turned off and back on, the old app password stops working and you'll need a new one.

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
4. Add environment variables in the Render dashboard (**Environment** tab): `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`. Leave `ALLOWED_ORIGINS` until you have your final Vercel URL.
5. Once both services are live, set `ALLOWED_ORIGINS` to your **production** Vercel domain (not a preview-deploy URL) plus `http://localhost:5173` for local testing, comma-separated, no spaces.
6. MongoDB Atlas → **Network Access** → allow `0.0.0.0/0`, since Render uses dynamic IPs.

### Notes on Render's free tier

Free services spin down after 15 minutes of inactivity. The first request after idling can take 30–50 seconds while it wakes up — this is normal, not a bug.

## Security

- `.env` is gitignored — never commit real credentials. If credentials are ever accidentally pushed, rotate them immediately (new MongoDB password, new Gmail app password).
- CORS is locked to the origins listed in `ALLOWED_ORIGINS`; update this every time your frontend URL changes.
