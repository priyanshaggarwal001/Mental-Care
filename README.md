<div align="center">

# 🧠 MindCare – SIH Mental Wellness Platform

**A full-stack mental wellness web application combining clinical screening tools, AI-powered chat support, and interactive self-help modules.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Ollama](https://img.shields.io/badge/Ollama-LLaMA_3.2-black)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-Educational-green)](#disclaimer)

</div>

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [✨ Features](#-features)
3. [🏗️ Architecture](#️-architecture)
4. [📁 Project Structure](#-project-structure)
5. [🛠️ Tech Stack](#️-tech-stack)
6. [🚀 Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Frontend Setup](#1-frontend-setup)
   - [Firebase Setup (Optional)](#2-firebase-setup-optional)
   - [AI Chat Backend Setup](#3-ai-chat-backend-setup)
7. [🗺️ Navigation & Tool Routing](#️-navigation--tool-routing)
8. [👤 User Profile & Settings](#-user-profile--settings)
9. [🔔 Notification System](#-notification-system)
10. [🗄️ localStorage Reference](#️-localstorage-reference)
11. [🧪 Available Scripts](#-available-scripts)
12. [🔧 Troubleshooting](#-troubleshooting)
13. [🔒 Security Notes](#-security-notes)
14. [⚠️ Disclaimer](#️-disclaimer)
15. [👥 Contributors](#-contributors)

---

## Overview

**MindCare** is a hybrid mental wellness platform built for the Smart India Hackathon (SIH). It provides users with scientifically-backed self-assessment tools, an AI chatbot for emotional support, calming activities, and counselor discovery — all within a single, accessible web experience.

The platform is designed with privacy in mind: it works fully offline (local auth, local AI) and only optionally integrates with Firebase for persistent cloud authentication.

> **This is an educational and wellness-support tool — not a clinical product. See the [Disclaimer](#️-disclaimer) for details.**

---

## ✨ Features

### 🩺 Mental Health Screening
| Module | Description |
|--------|-------------|
| **PHQ-9** | Patient Health Questionnaire — screens for depression severity |
| **GAD-7** | Generalized Anxiety Disorder scale — screens for anxiety levels |

Both modules score responses, display severity ratings, and provide guidance based on results.

### 🤖 AI Chat Assistant
- Floating chat widget available on the homepage
- Powered by a local **LLaMA 3.2** model via **Ollama**
- Context-aware responses using **ChromaDB** knowledge ingestion
- Keyword-based safety filtering to handle crisis mentions appropriately

### 🎮 Mood Game
- Interactive mood-lifting mini-game
- Designed to provide a positive distraction and emotional reset
- Improved gameplay mechanics for engaging sessions

### 🧘 Activities Module
- Curated calming exercises (breathing, mindfulness, stretching)
- Timer-based activity sessions
- Built-in progress tracking per activity

### 📊 Progress Dashboard
- Visual summary of tool usage statistics
- Tracks assessment history and activity streaks
- Data persisted in `localStorage` — no account required for basic use

### 🩻 Counselor Consultation
- Browse and filter real counselor profiles (loaded from `counselors.csv`)
- Checkout flow for booking consultations (demo/Razorpay-style)

### 🔐 Authentication
- **Local fallback auth** — works with zero configuration
- **Firebase email/password** — when Firebase env vars are set
- **Google Sign-In** — when Firebase is configured
- Login-first gating: unauthenticated users are always redirected to the Auth page

### 🔔 Notification System
- **Toast notifications** — floating in-app messages (success, error, info, warning) with auto-close or persistent mode
- **Browser push notifications** — appear even when the tab is not in focus (requires user permission)
- **Notification history** — all notifications persisted in `localStorage` (up to 50 most recent)
- Pre-built helpers: `notifyBookingComplete`, `notifyActivityComplete`, `notifySuccess`, `notifyError`
- Automatically triggered on booking confirmation and activity completion
- See [`NOTIFICATIONS.md`](NOTIFICATIONS.md) for the full API reference, usage examples, and customization guide

### 🎨 UX Extras
- 🌙 **Dark mode** toggle (persisted across sessions)
- 🎵 **Ambient background music** toggle
- 👤 **User dropdown** with profile settings, theme toggle, and logout
- Fully responsive layout

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                      │
│                                                         │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  index.html  │    │      index (1).html           │   │
│  │  (Landing)   │    │   Vite + React SPA            │   │
│  │  Static page │    │   App.jsx orchestrates:       │   │
│  │  + chat      │    │   PHQ9 / GAD7 / MoodGame /    │   │
│  │  widget      │    │   Activity / Progress /       │   │
│  └──────┬───────┘    │   Consulting / Auth           │   │
│         │            └──────────────────────────────┘   │
└─────────┼───────────────────────────────────────────────┘
          │ POST /chat
          ▼
┌─────────────────────────────────────────────────────────┐
│              Local Python AI Backend (mental/)          │
│                                                         │
│  chat_server.py  ──►  brain.py  ──►  ChromaDB (RAG)    │
│                            │                            │
│                            └──►  Ollama (LLaMA 3.2)    │
│  safety.py  (crisis keyword detection)                  │
│  ingest.py  (one-time document ingestion)               │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
Mental-Care/
├── index.html              # Public landing page with chat widget
├── index (1).html          # React SPA entry point
├── index copy 2.html       # Razorpay-style counselor checkout demo
├── App.jsx                 # Root React component & tool router
├── AppShell.css            # Global app shell styles
│
├── AuthPage.jsx / .css     # Login & Sign-up page
├── PHQ9Page.jsx            # PHQ-9 depression screening page
├── PHQ9Module.jsx          # PHQ-9 scoring logic
├── GAD7Page.jsx            # GAD-7 anxiety screening page
├── GAD7Module.jsx          # GAD-7 scoring logic
├── MoodGamePage.jsx / .css # Interactive mood game
├── ActivityPage.jsx / .css # Calming activities & timers
├── ConsultingPage.jsx/.css # Counselor browse & filter
├── ProgressPage.jsx / .css # Usage progress dashboard
├── ScreeningPage.jsx       # Shared screening wrapper
├── ScreeningModule.css     # Shared screening styles
├── WellnessShared.css      # Cross-module shared styles
│
├── firebaseAuth.js         # Firebase auth helpers
├── wellnessStats.js        # LocalStorage stats utilities
├── notificationService.js  # Toast & browser push notification helpers
├── counselors.csv          # Counselor data
├── server.js               # (Dev) static file server
│
├── NOTIFICATIONS.md        # Notification system API reference & guide
│
├── mental/                 # Python AI backend
│   ├── chat_server.py      # FastAPI chat endpoint
│   ├── brain.py            # LLM + RAG response logic
│   ├── safety.py           # Crisis keyword detection
│   ├── ingest.py           # Knowledge base ingestion script
│   ├── app.py              # Streamlit debug UI
│   ├── streamlit_app.py    # Additional Streamlit interface
│   ├── requirements.txt    # Python dependencies
│   └── data/               # Documents for RAG ingestion
│
├── .env.example            # Firebase env var template
├── package.json            # Node.js project config
└── vite.config.js          # Vite build config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Authentication** | Firebase Web SDK v12 (optional) / Local fallback |
| **AI Model** | LLaMA 3.2 via Ollama |
| **Vector Database** | ChromaDB (RAG knowledge context) |
| **LLM Orchestration** | LangChain + LangChain Community |
| **PDF Parsing** | pypdf |
| **Debug UI** | Streamlit |
| **Styling** | Plain CSS (no CSS framework) |
| **Storage** | Browser `localStorage` (no backend DB required) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Python** ≥ 3.10
- **Ollama** installed — [ollama.com/download](https://ollama.com/download)
- (Optional) A **Firebase** project — [console.firebase.google.com](https://console.firebase.google.com)

---

### 1. Frontend Setup

Clone the repository and install dependencies from the project root:

```bash
npm install
npm run dev
```

The dev server opens at:

```
http://localhost:5173/index%20(1).html
```

**Production build:**

```bash
npm run build
npm run preview
```

> The build step automatically copies `index (1).html`, `index copy 2.html`, and `counselors.csv` into `dist/`.

---

### 2. Firebase Setup (Optional)

Firebase is **optional**. Without it, local auth works out of the box.

To enable Firebase:

```bash
cp .env.example .env
```

Fill in your values from [Firebase Console → Project Settings → General → Your apps](https://console.firebase.google.com):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

To enable **Google Sign-In**, go to Firebase Console → Authentication → Sign-in method → Enable Google.

---

### 3. AI Chat Backend Setup

The AI backend requires **two terminals** running simultaneously.

**Terminal 1 — Start the chat server:**

```bash
cd mental
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python chat_server.py
```

The chat API will be available at `http://127.0.0.1:8000`.

**Terminal 2 — Start Ollama:**

```bash
ollama serve
```

**Pull the required model** (first-time only):

```bash
ollama pull llama3.2
```

**Optional: Ingest knowledge documents for RAG context** (first-time only):

```bash
cd mental
python ingest.py
```

Place your PDF/text documents in `mental/data/` before running `ingest.py`.

**Test the chat endpoint:**

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel anxious before exams"}'
```

---

## 🗺️ Navigation & Tool Routing

The React SPA uses **URL query parameters** to determine which module to display. This allows deep-linking directly to any tool.

| URL | Module |
|-----|--------|
| `index (1).html?tool=AUTH` | Login / Sign-up |
| `index (1).html?tool=PHQ9` | PHQ-9 Depression Screening |
| `index (1).html?tool=GAD7` | GAD-7 Anxiety Screening |
| `index (1).html?tool=MOOD_GAME` | Mood Game |
| `index (1).html?tool=ACTIVITY` | Calming Activities |
| `index (1).html?tool=PROGRESS` | Progress Dashboard |
| `index (1).html?tool=CONSULT` | Counselor Consultation |

> Tool state is managed in `App.jsx` and kept in sync with the browser URL via `window.history.replaceState`. Unauthenticated users are automatically redirected to `?tool=AUTH`.

---

## 👤 User Profile & Settings

Profile settings are accessible from the **top-right user dropdown**.

**Editable fields:**
- Full name
- Phone number
- City
- Short bio
- Daily reminders preference (toggle)

**Behavior:**
- All data is saved to `localStorage` keyed by user email — no server required.
- Name changes update the avatar/display name immediately.
- When Firebase is active, the display name is also synced to the Firebase Auth profile.

---

## 🔔 Notification System

MindCare includes a built-in notification system (`notificationService.js`) for real-time user feedback and engagement. It supports three layers of notifications:

| Type | Description |
|------|-------------|
| **Toast Notifications** | Floating in-app banners (top-right) with configurable duration |
| **Browser Push Notifications** | Native OS-level alerts, visible even when the tab is unfocused |
| **Notification History** | Persisted pool of up to 50 recent notifications in `localStorage` |

### Quick Usage

```javascript
import {
  showToast,
  notifyBookingComplete,
  notifyActivityComplete,
  notifySuccess,
  notifyError,
  getNotificationHistory,
  clearNotificationHistory,
} from './notificationService';

// Show a toast
showToast('Profile saved!', 'success', 4000);

// Booking confirmation (toast + push + history)
notifyBookingComplete({ counselorName: 'Dr. Sarah', amount: 499, bookingId: 'BK1', transactionId: 'TX1' });

// Activity completion (toast + push + history)
notifyActivityComplete('Deep Breathing Exercise');

// Retrieve stored history
const history = getNotificationHistory();
```

**Toast types:** `'success'` | `'error'` | `'info'` | `'warning'`  
**Duration:** milliseconds — pass `0` for a persistent (non-closing) toast.

### Where It's Already Integrated

- ✅ **Booking Completion** (`ConsultingPage.jsx`)
- ✅ **Activity Completion** (`ActivityPage.jsx`)

### Browser Support

| Browser | Toast | Push |
|---------|-------|------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari (macOS) | ✅ | ⚠️ |
| Edge | ✅ | ✅ |
| Safari (iOS) | ✅ | ❌ |

> For the full API reference, customization guide, and more usage examples, see [`NOTIFICATIONS.md`](NOTIFICATIONS.md).

---

## 🗄️ localStorage Reference

| Key | Purpose |
|-----|---------|
| `wellness_auth_session` | Boolean flag — is the user authenticated? |
| `wellness_auth_user` | JSON object — current user name & email |
| `wellness_local_users` | Array of locally registered users (fallback auth) |
| `wellness_user_profiles` | Map of user profiles keyed by email |
| `wellness_theme_dark` | Boolean — dark mode preference |
| `wellness_music_enabled` | Boolean — ambient music preference |
| `wellness_stats_v1` | Object — usage statistics for Progress Dashboard |
| `wellness_notifications` | Array — up to 50 most recent notification records (booking, activity, etc.) |

---

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server and open `index (1).html` |
| `npm run build` | Build for production and copy static assets to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## 🔧 Troubleshooting

<details>
<summary><strong>❌ npm run dev fails</strong></summary>

- Run `npm install` to ensure all dependencies are installed.
- Check that no other process is already using Vite's default port (`5173`).
- Try `npm run dev -- --port 3000` to use an alternate port.

</details>

<details>
<summary><strong>❌ Firebase Google login not working</strong></summary>

- Confirm all `VITE_FIREBASE_*` values are correctly set in your `.env` file.
- Ensure the **Google sign-in provider** is enabled in Firebase Console → Authentication → Sign-in method.
- Check the browser console for specific Firebase error codes.

</details>

<details>
<summary><strong>❌ Chat widget shows a backend error</strong></summary>

- Verify `chat_server.py` is running: `curl http://127.0.0.1:8000/chat`
- Verify Ollama is running: `ollama list`
- Verify the `llama3.2` model is downloaded: `ollama pull llama3.2`

</details>

<details>
<summary><strong>❌ ollama serve returns an address-in-use error</strong></summary>

- Ollama is likely already running. You can reuse the existing instance — no need to start a second one.
- To find and stop the existing process: `lsof -i :11434` then `kill <PID>`.

</details>

<details>
<summary><strong>❌ Counselors page or checkout page missing after build</strong></summary>

- Always use `npm run build` — it copies `counselors.csv` and `index copy 2.html` to `dist/`.
- Do **not** manually copy files; let the build script handle it.

</details>

---

## 🔒 Security Notes

- **Never commit secrets.** Keep `.env` in `.gitignore` (it already is — see `.env.example`).
- The payment checkout flow (`index copy 2.html`) is for **demo purposes only** and does not process real transactions.
- The AI chat includes keyword-based safety detection (`safety.py`) but is **not a certified crisis intervention system**.
- All user data is stored in the browser's `localStorage` — no data is sent to any external server unless Firebase is configured.

---

## ⚠️ Disclaimer

> **MindCare is for educational and wellness-support use only.**
>
> It is **not** a substitute for professional mental health diagnosis, therapy, or emergency care. Scores from PHQ-9 and GAD-7 are screening tools, not clinical diagnoses.
>
> **If you or someone you know is in immediate danger, please contact your local emergency services or a crisis helpline immediately.**
>
> 🇮🇳 India: iCall — **9152987821** | Vandrevala Foundation — **1860-2662-345** (24/7)

---

## 👥 Contributors

**MindCare** was built as part of the Smart India Hackathon (SIH) by a team of students from VIT Bhopal University.

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

---

<div align="center">

Made with ❤️ for mental wellness 

</div>

