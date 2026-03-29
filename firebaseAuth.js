import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

let app = null;
let auth = null;
let googleProvider = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export function isFirebaseConfigured() {
  return isConfigured;
}

export function subscribeAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function authWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values.");
  }

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function authSignUp(name, email, password) {
  if (!auth) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values.");
  }

  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  if (name?.trim()) {
    await updateProfile(credentials.user, { displayName: name.trim() });
  }
  return credentials.user;
}

export async function authLogin(email, password) {
  if (!auth) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values.");
  }

  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
}

export async function authLogout() {
  if (!auth) return;
  await signOut(auth);
}

export async function authUpdateDisplayName(name) {
  if (!auth?.currentUser) {
    throw new Error("No authenticated user found.");
  }

  await updateProfile(auth.currentUser, { displayName: name?.trim() || "" });
  return auth.currentUser;
}
