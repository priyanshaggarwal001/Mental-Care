import React, { useEffect, useMemo, useState } from "react";
import "./WellnessShared.css";
import "./AuthPage.css";
import {
  authLogin,
  authLogout,
  authSignUp,
  authUpdateDisplayName,
  authWithGoogle,
  isFirebaseConfigured,
  subscribeAuth,
} from "./firebaseAuth";

const AUTH_SESSION_KEY = "wellness_auth_session";
const AUTH_USER_KEY = "wellness_auth_user";
const PROFILE_STORE_KEY = "wellness_user_profiles";

function getRedirectTarget() {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/";
}

function markSession(userInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_SESSION_KEY, "true");
  if (userInfo) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userInfo));
  }
}

function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

function readStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const stored = JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || "null");
    return stored || null;
  } catch {
    return null;
  }
}

function readStoredProfiles() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredProfiles(nextProfiles) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(nextProfiles));
}

function notifyUserUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wellness-user-updated"));
}

function readableFirebaseError(errorMessage) {
  if (!errorMessage) return "Something went wrong. Try again.";

  if (errorMessage.includes("auth/invalid-email")) return "Please enter a valid email address.";
  if (errorMessage.includes("auth/missing-password")) return "Password is required.";
  if (errorMessage.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  if (errorMessage.includes("auth/email-already-in-use")) return "Email is already registered. Please login.";
  if (errorMessage.includes("auth/invalid-credential")) return "Invalid credentials. Please check email/password.";
  if (errorMessage.includes("auth/popup-closed-by-user")) return "Google popup was closed before sign-in.";

  return errorMessage;
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState(null);
  const [sessionUser, setSessionUser] = useState(() => readStoredUser());
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    city: "",
    bio: "",
    reminders: true,
  });
  const [profileStatus, setProfileStatus] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [localUsers, setLocalUsers] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("wellness_local_users") || "[]");
    } catch {
      return [];
    }
  });

  const redirectTarget = useMemo(() => getRedirectTarget(), []);

  const firebaseReady = useMemo(() => isFirebaseConfigured(), []);
  const isSessionActive = typeof window !== "undefined" && window.localStorage.getItem(AUTH_SESSION_KEY) === "true";

  useEffect(() => {
    if (!sessionUser?.email) {
      setProfileForm({
        name: sessionUser?.name || "",
        phone: "",
        city: "",
        bio: "",
        reminders: true,
      });
      return;
    }

    const profiles = readStoredProfiles();
    const saved = profiles[sessionUser.email.toLowerCase()] || {};

    setProfileForm({
      name: saved.name || sessionUser.name || "",
      phone: saved.phone || "",
      city: saved.city || "",
      bio: saved.bio || "",
      reminders: typeof saved.reminders === "boolean" ? saved.reminders : true,
    });
  }, [sessionUser]);

  useEffect(() => {
    const unsubscribe = subscribeAuth((nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const nextSessionUser = {
          name: nextUser.displayName || "",
          email: nextUser.email || "",
          provider: "firebase",
        };
        markSession(nextSessionUser);
        setSessionUser(nextSessionUser);
        notifyUserUpdated();
        setNotice(`Signed in as ${nextUser.displayName || nextUser.email}`);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (firebaseReady) {
        if (mode === "signup") {
          const signedUp = await authSignUp(name, email, password);
          markSession({
            name: signedUp.displayName || name || "",
            email: signedUp.email || email,
            provider: "firebase",
          });
          setNotice(`Welcome ${signedUp.displayName || signedUp.email}! Account created.`);
        } else {
          const loggedIn = await authLogin(email, password);
          markSession({
            name: loggedIn.displayName || "",
            email: loggedIn.email || email,
            provider: "firebase",
          });
          setNotice(`Welcome back ${loggedIn.displayName || loggedIn.email}!`);
        }
      } else {
        if (mode === "signup") {
          const exists = localUsers.some((item) => item.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            throw new Error("Email is already registered. Please login.");
          }

          const nextUsers = [...localUsers, { name: name.trim(), email: email.trim(), password }];
          setLocalUsers(nextUsers);
          window.localStorage.setItem("wellness_local_users", JSON.stringify(nextUsers));
          const nextSessionUser = { name: name.trim(), email: email.trim(), provider: "local" };
          markSession(nextSessionUser);
          setSessionUser(nextSessionUser);
          notifyUserUpdated();
          setNotice(`Welcome ${name || email}! Account created.`);
        } else {
          const found = localUsers.find(
            (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
          );
          if (!found) {
            throw new Error("Invalid credentials. Please check email/password.");
          }
          const nextSessionUser = { name: found.name || "", email: found.email, provider: "local" };
          markSession(nextSessionUser);
          setSessionUser(nextSessionUser);
          notifyUserUpdated();
          setNotice(`Welcome back ${found.name || found.email}!`);
        }
      }

      window.setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    } catch (err) {
      setError(readableFirebaseError(err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (!firebaseReady) {
        throw new Error("Google login requires Firebase config in .env file.");
      }

      const googleUser = await authWithGoogle();
      const nextSessionUser = {
        name: googleUser.displayName || "",
        email: googleUser.email || "",
        provider: "google",
      };
      markSession(nextSessionUser);
      setSessionUser(nextSessionUser);
      notifyUserUpdated();
      setNotice(`Welcome ${googleUser.displayName || googleUser.email}!`);

      window.setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    } catch (err) {
      setError(readableFirebaseError(err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try {
      if (firebaseReady) {
        await authLogout();
      }
      clearSession();
      setNotice("You are now logged out.");
      setProfileStatus("");
      setUser(null);
      setSessionUser(null);
      notifyUserUpdated();
    } catch (err) {
      setError(readableFirebaseError(err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    if (!sessionUser?.email) {
      setProfileStatus("Please login first to edit your profile.");
      return;
    }

    setProfileBusy(true);
    setProfileStatus("");

    try {
      const trimmedName = profileForm.name.trim();
      if (!trimmedName) {
        throw new Error("Name is required.");
      }

      if (firebaseReady && user) {
        await authUpdateDisplayName(trimmedName);
      }

      const normalizedEmail = sessionUser.email.toLowerCase();
      const profiles = readStoredProfiles();
      profiles[normalizedEmail] = {
        name: trimmedName,
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        bio: profileForm.bio.trim(),
        reminders: Boolean(profileForm.reminders),
      };
      saveStoredProfiles(profiles);

      const nextSessionUser = {
        ...sessionUser,
        name: trimmedName,
      };
      markSession(nextSessionUser);
      setSessionUser(nextSessionUser);

      const savedUsers = JSON.parse(window.localStorage.getItem("wellness_local_users") || "[]");
      if (Array.isArray(savedUsers) && savedUsers.length) {
        const updatedUsers = savedUsers.map((item) => {
          if ((item.email || "").toLowerCase() === normalizedEmail) {
            return { ...item, name: trimmedName };
          }
          return item;
        });
        window.localStorage.setItem("wellness_local_users", JSON.stringify(updatedUsers));
        setLocalUsers(updatedUsers);
      }

      notifyUserUpdated();
      setProfileStatus("Profile settings saved successfully.");
    } catch (err) {
      setProfileStatus(readableFirebaseError(err?.message || "Unable to save profile."));
    } finally {
      setProfileBusy(false);
    }
  }

  return (
    <div className="wellness-page">
      <div className="wellness-card auth-card">
        <h1 className="wellness-title">Login / Sign Up</h1>
        <p className="wellness-subtitle">Secure access for personalized wellness journey.</p>

        {isSessionActive && sessionUser && (
          <div className="profile-settings-card">
            <h2>Profile Settings</h2>
            <p>Manage your personal details and wellness preferences.</p>

            <form className="profile-form" onSubmit={handleProfileSave}>
              <label>
                Full Name
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </label>

              <label>
                City
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Optional"
                />
              </label>

              <label>
                Short Bio
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your wellness goals"
                  rows={3}
                />
              </label>

              <label className="profile-checkbox">
                <input
                  type="checkbox"
                  checked={profileForm.reminders}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, reminders: e.target.checked }))}
                />
                <span>Enable daily wellness reminders</span>
              </label>

              <button type="submit" className="wellness-btn auth-main-btn" disabled={profileBusy}>
                {profileBusy ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {profileStatus && <div className="auth-alert success">{profileStatus}</div>}
          </div>
        )}

        {!firebaseReady && (
          <div className="auth-alert warn">
            Firebase not configured. Email login/signup works in local mode. For Google login, add values from `.env.example` into `.env`.
          </div>
        )}

        <div className="auth-switch">
          <button
            type="button"
            className={`auth-switch-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="wellness-btn auth-main-btn" disabled={busy}>
            {busy ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>

        <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </button>

        {user && (
          <button type="button" className="wellness-btn auth-main-btn" onClick={handleLogout} disabled={busy}>
            Logout
          </button>
        )}

        {error && <div className="auth-alert error">{error}</div>}
        {notice && <div className="auth-alert success">{notice}</div>}
      </div>
    </div>
  );
}
