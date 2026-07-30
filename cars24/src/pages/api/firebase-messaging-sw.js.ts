import type { NextApiRequest, NextApiResponse } from "next";

// Served at /api/firebase-messaging-sw.js (Next.js strips only the final
// ".ts" from this filename, leaving the ".js" in the route path).
//
// Firebase's web push requires a service worker file that calls
// firebase.initializeApp(...) with the project config - but a static file
// under public/ can't read server env vars, and hardcoding the config there
// means keeping two copies in sync (this file + lib/firebase.ts). Generating
// it here keeps NEXT_PUBLIC_FIREBASE_* as the single source of truth.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const body = `
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

// Fires when a push arrives while no Cars24 tab is focused/open.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "Cars24";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "/favicon.ico",
  };
  self.registration.showNotification(title, options);
});
`.trim();

  res.setHeader("Content-Type", "application/javascript");
  // A service worker's default scope is limited to the directory it's served
  // from (here, /api/) - this header widens it to the whole site so it can
  // actually receive pushes for pages outside /api/.
  res.setHeader("Service-Worker-Allowed", "/");
  res.status(200).send(body);
}
