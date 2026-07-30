import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";
import { registerFcmToken, unregisterFcmToken } from "./userapi";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const TOKEN_STORAGE_KEY = "cars24_fcm_token";

export type PushPermissionResult =
  | { status: "enabled"; token: string }
  | { status: "denied" }
  | { status: "unsupported" };

// Prompts the browser's native permission dialog, retrieves an FCM
// registration token for this browser, and registers it against the given
// user on the backend. Call this from a real user gesture (a button click) -
// browsers ignore/auto-deny permission requests that aren't user-initiated.
export async function enablePushNotifications(userId: string): Promise<PushPermissionResult> {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return { status: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { status: "denied" };
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging || !VAPID_KEY) {
    return { status: "unsupported" };
  }

  const registration = await navigator.serviceWorker.register("/api/firebase-messaging-sw.js");

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return { status: "unsupported" };
  }

  await registerFcmToken(userId, token);
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // non-fatal - just won't remember across reloads
  }

  return { status: "enabled", token };
}

export function getStoredPushToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function disablePushNotifications(userId: string): Promise<void> {
  const token = getStoredPushToken();
  if (!token) return;

  try {
    await unregisterFcmToken(userId, token);
  } catch {
    // best-effort - if this fails the token just goes stale server-side and
    // gets cleaned up automatically the next time a send to it fails
  } finally {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}