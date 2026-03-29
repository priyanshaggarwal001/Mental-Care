# SIH Mental Care Platform

A hybrid mental wellness web project that combines a rich public landing page, a React app for screening and self-help tools, and a local Python AI chat backend.

## Overview

This repository includes:

- A static homepage in index.html.
- A Vite + React app entry in index (1).html that powers the interactive modules.
- A local AI chatbot service in mental/chat_server.py (Ollama + ChromaDB).
- Counselor discovery with CSV data and a checkout flow.

## Main Features

- PHQ-9 and GAD-7 mental health screening modules.
- Interactive mood game with improved gameplay mechanics.
- Activities module with calming exercises and timer-based sessions.
- Progress dashboard based on stored usage stats.
- Consultation page with counselor filtering using counselors.csv.
- Login/Sign up with:
  - Local fallback auth.
  - Firebase email/password auth (when configured).
  - Google sign-in (when Firebase is configured).
- Login-first app gating (users are redirected to AUTH first).
- User dropdown with:
  - Profile settings.
  - Dark mode toggle.
  - Logout.
- Persistent ambient music toggle.
- Floating chat widget on homepage that calls the local AI backend.

## Project Structure

```text
.
|-- index.html
|-- index (1).html
|-- App.jsx
|-- AppShell.css
|-- AuthPage.jsx
|-- AuthPage.css
|-- PHQ9Page.jsx
|-- PHQ9Module.jsx
|-- GAD7Page.jsx
|-- GAD7Module.jsx
|-- MoodGamePage.jsx
|-- MoodGamePage.css
|-- ActivityPage.jsx
|-- ActivityPage.css
|-- ConsultingPage.jsx
|-- ConsultingPage.css
|-- ProgressPage.jsx
|-- ProgressPage.css
|-- ScreeningPage.jsx
|-- ScreeningModule.css
|-- firebaseAuth.js
|-- wellnessStats.js
|-- counselors.csv
|-- index copy 2.html
|-- server.js
|-- mental/
|   |-- chat_server.py
|   |-- brain.py
|   |-- safety.py
|   |-- ingest.py
|   |-- app.py
|   |-- requirements.txt
|   `-- db/
|-- package.json
`-- vite.config.js
```

## Tech Stack

- Frontend: React 18, Vite 5.
- Auth: Firebase Web SDK (optional but recommended).
- AI backend: Python, Ollama, ChromaDB.
- Optional payment demo: Razorpay-style checkout page.

## Local Setup

### 1. Frontend setup

Run from repository root:

```bash
npm install
npm run dev
```

Dev app opens at:

- http://localhost:5173/index%20(1).html

Production build:

```bash
npm run build
npm run preview
```

Build output also copies these files into dist:

- index (1).html
- index copy 2.html
- counselors.csv

### 2. Firebase setup (optional)

Create .env from template:

```bash
cp .env.example .env
```

Add values for:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Without Firebase values, auth still works in local fallback mode.

### 3. AI chat backend setup

In terminal 1:

```bash
cd mental
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python chat_server.py
```

In terminal 2:

```bash
ollama serve
```

Ensure model is present:

```bash
ollama pull llama3.2
```

Optional one-time ingestion for knowledge context:

```bash
cd mental
python ingest.py
```

Chat endpoint:

- POST http://127.0.0.1:8000/chat

Example:

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel anxious before exams"}'
```

## Navigation and Tool Routing

The homepage and app communicate through query parameters.

Example routes:

- index (1).html?tool=PHQ9
- index (1).html?tool=GAD7
- index (1).html?tool=MOOD_GAME
- index (1).html?tool=CONSULT
- index (1).html?tool=ACTIVITY
- index (1).html?tool=PROGRESS
- index (1).html?tool=AUTH

App tool state is managed in App.jsx and synced to URL.

## Profile Settings

Profile settings are available in the top-right user dropdown.

Current profile fields:

- Full name
- Phone number
- City
- Short bio
- Daily reminders preference

Behavior:

- Data is saved in localStorage (per user email).
- Name updates sync to the user tab immediately.
- If Firebase is active, display name is also updated in Firebase auth profile.

## Local Storage Keys Used

- wellness_auth_session
- wellness_auth_user
- wellness_local_users
- wellness_user_profiles
- wellness_theme_dark
- wellness_music_enabled
- wellness_stats_v1

## Scripts

- npm run dev: starts Vite and opens index (1).html.
- npm run build: builds app and copies required static files to dist.
- npm run preview: previews dist and opens index (1).html.

## Troubleshooting

### npm run dev fails

- Ensure dependencies are installed with npm install.
- Ensure no process is already using the same Vite port.

### Firebase Google login not working

- Confirm all VITE_FIREBASE_* env values are set.
- Ensure Google provider is enabled in Firebase console.

### Chat widget shows backend error

- Confirm chat_server.py is running on 127.0.0.1:8000.
- Confirm Ollama is running and llama3.2 is available.

### ollama serve returns error

- A common reason is Ollama already running on the same port.
- Stop previous Ollama process or reuse the already running service.

### Counselors or payment page missing in build

- Run npm run build (it copies counselors.csv and index copy 2.html into dist).

## Security Notes

- Do not commit real secrets or production API keys.
- Current payment flow and backend file are for demo/testing purposes.
- The app includes keyword-based safety checks, but it is not a clinical emergency tool.

## Disclaimer

This platform is for educational and wellness-support use only. It is not a substitute for professional diagnosis, treatment, or emergency mental health care.

If someone is in immediate danger, contact local emergency services immediately.

## Contributors

# Contributors – MindCare Project

| Name | Registration Number |
|------|---------------------|
| Shubham Tripathi | 23BCE11262 |
| Khushi Yadav | 23BAI10456 |
| Priyansh Aggarwal | 23BCE11242 |
| Lakshyawardhan Singh | 23BCE10631 |
| Saral Saxena | 23BCE10040 |
| Deviyansh Rajpurohit | 23BCE11167 |
| Tamanna Garg | 23BCY10089 |
| Khushi Singh Chauhan | 23BAI10408 |
| Kevin John Sinoey | 23BEC10015 |

