import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// All of these are meant to be public/client-exposed per Firebase's own docs
// (they identify the project, they don't authenticate anything) - safe to
// ship in NEXT_PUBLIC_* env vars. Get the actual values from:
// Firebase Console > Project Settings > General > "Your apps" > Web app.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Messaging only works in the browser (and only in browsers that support the
// Push API - e.g. not Safari < 16, not any server render), so this resolves
// to null instead of throwing when it isn't available.
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(getFirebaseApp());
}

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);