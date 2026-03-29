import React, { useEffect, useRef, useState } from "react";
import PHQ9Page from "./PHQ9Page";
import GAD7Page from "./GAD7Page";
import MoodGamePage from "./MoodGamePage";
import ConsultingPage from "./ConsultingPage";
import ActivityPage from "./ActivityPage";
import ProgressPage from "./ProgressPage";
import AuthPage from "./AuthPage";
import "./AppShell.css";
import { authLogout } from "./firebaseAuth";

const VALID_TOOLS = ["PHQ9", "GAD7", "MOOD_GAME", "CONSULT", "ACTIVITY", "PROGRESS", "AUTH"];
const MUSIC_KEY = "wellness_music_enabled";
const MUSIC_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
const AUTH_SESSION_KEY = "wellness_auth_session";
const AUTH_USER_KEY = "wellness_auth_user";
const THEME_DARK_KEY = "wellness_theme_dark";

function getInitialTool() {
  if (typeof window === "undefined") return "PHQ9";

  const params = new URLSearchParams(window.location.search);
  const requestedTool = params.get("tool");
  return VALID_TOOLS.includes(requestedTool) ? requestedTool : "PHQ9";
}

function readStoredUserInfo() {
  if (typeof window === "undefined") return { name: "User", email: "" };

  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || "{\"name\":\"User\",\"email\":\"\"}");
  } catch {
    return { name: "User", email: "" };
  }
}

export default function App() {
  const [tool, setTool] = useState(getInitialTool);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_DARK_KEY) === "true";
  });
  const [userInfo, setUserInfo] = useState(readStoredUserInfo);
  const [musicEnabled, setMusicEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(MUSIC_KEY) === "true";
  });
  const ambientAudioRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const isAuthed = typeof window !== "undefined" && window.localStorage.getItem(AUTH_SESSION_KEY) === "true";

    if (!isAuthed && tool !== "AUTH") {
      const redirectTarget = `${window.location.pathname}?tool=${tool}`;
      const authUrl = new URL(window.location.href);
      authUrl.searchParams.set("tool", "AUTH");
      authUrl.searchParams.set("redirect", redirectTarget);
      window.history.replaceState({}, "", `${authUrl.pathname}?${authUrl.searchParams.toString()}`);
      setTool("AUTH");
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("tool", tool);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [tool]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MUSIC_KEY, String(musicEnabled));

    const audio = ambientAudioRef.current;
    if (!audio) return;

    if (musicEnabled) {
      audio.volume = 0.14;
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Browser may block autoplay before user interaction.
        });
      }
    } else {
      audio.pause();
      audio.muted = true;
    }
  }, [musicEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_DARK_KEY, String(themeDark));
    document.body.classList.toggle("theme-dark", themeDark);
  }, [themeDark]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  useEffect(() => {
    const refreshUser = () => setUserInfo(readStoredUserInfo());

    window.addEventListener("storage", refreshUser);
    window.addEventListener("wellness-user-updated", refreshUser);

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("wellness-user-updated", refreshUser);
    };
  }, []);

  async function handleLogout() {
    try {
      await authLogout();
    } catch {
      // noop
    }

    window.localStorage.removeItem(AUTH_SESSION_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    setUserInfo({ name: "User", email: "" });
    setMenuOpen(false);
    setTool("AUTH");
    const authUrl = new URL(window.location.href);
    authUrl.searchParams.set("tool", "AUTH");
    window.history.replaceState({}, "", `${authUrl.pathname}?${authUrl.searchParams.toString()}`);
  }

  const userLabel = (userInfo?.name || userInfo?.email || "User").trim();
  const userInitial = (userLabel[0] || "U").toUpperCase();

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-brand">Health Page</div>
        <div className="app-top-actions">
          <button
            type="button"
            className="app-music-btn"
            onClick={() => setMusicEnabled((value) => !value)}
          >
            {musicEnabled ? "Mute Music" : "Play Music"}
          </button>
          <a className="app-home-btn" href="/">Home</a>
          <div className="app-user-menu" ref={userMenuRef}>
            <button type="button" className="app-user-btn" onClick={() => setMenuOpen((v) => !v)}>
              <span className="app-user-avatar">{userInitial}</span>
              <span className="app-user-name">{userLabel}</span>
            </button>

            {menuOpen && (
              <div className="app-user-dropdown">
                <div className="app-user-meta">
                  <strong>{userLabel}</strong>
                  <small>{userInfo?.email || "No email"}</small>
                </div>
                <button type="button" onClick={() => { setMenuOpen(false); setTool("AUTH"); }}>
                  Profile Settings
                </button>
                <button type="button" onClick={() => { setThemeDark((v) => !v); }}>
                  {themeDark ? "Disable Dark Mode" : "Enable Dark Mode"}
                </button>
                <button type="button" className="danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <audio ref={ambientAudioRef} loop preload="none" src={MUSIC_SRC} />

      <section className="app-hero">
        <div className="app-switch-card">
          <div className="app-switch-tabs">
            <button
              type="button"
              className={`app-tab-button ${tool === "CONSULT" ? "active" : ""}`}
              onClick={() => setTool("CONSULT")}
            >
              Consult
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "PHQ9" ? "active" : ""}`}
              onClick={() => setTool("PHQ9")}
            >
              PHQ-9 (Depression)
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "GAD7" ? "active" : ""}`}
              onClick={() => setTool("GAD7")}
            >
              GAD-7 (Anxiety)
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "MOOD_GAME" ? "active" : ""}`}
              onClick={() => setTool("MOOD_GAME")}
            >
              Mood Game
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "ACTIVITY" ? "active" : ""}`}
              onClick={() => setTool("ACTIVITY")}
            >
              Activities
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "PROGRESS" ? "active" : ""}`}
              onClick={() => setTool("PROGRESS")}
            >
              Progress
            </button>
            <button
              type="button"
              className={`app-tab-button ${tool === "AUTH" ? "active" : ""}`}
              onClick={() => setTool("AUTH")}
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </section>

      <main className="app-content">
        {/* Render selected page */}
        {tool === "CONSULT" && <ConsultingPage />}
        {tool === "PHQ9" && <PHQ9Page />}
        {tool === "GAD7" && <GAD7Page />}
        {tool === "MOOD_GAME" && <MoodGamePage />}
        {tool === "ACTIVITY" && <ActivityPage />}
        {tool === "PROGRESS" && <ProgressPage />}
        {tool === "AUTH" && <AuthPage />}
      </main>
    </div>
  );
}
