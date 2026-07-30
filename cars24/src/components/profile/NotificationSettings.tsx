import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/userapi";
import {
  enablePushNotifications,
  disablePushNotifications,
  getStoredPushToken,
} from "@/lib/pushNotifications";

type Props = {
  userId: string;
};

const CATEGORY_LABELS: { key: keyof NotificationPreferences; label: string; description: string; wired: boolean }[] = [
  {
    key: "appointmentAndBookingUpdates",
    label: "Booking & Appointment Updates",
    description: "Confirmations for purchases and inspection appointments.",
    wired: true,
  },
  {
    key: "bidUpdates",
    label: "Bid Updates",
    description: "Coming soon - Cars24 doesn't have bidding yet, but your preference is saved for when it does.",
    wired: false,
  },
  {
    key: "priceDrops",
    label: "Price Drops",
    description: "Coming soon - price-change tracking isn't built yet, but your preference is saved for when it is.",
    wired: false,
  },
  {
    key: "newMessages",
    label: "New Messages",
    description: "Coming soon - Cars24 doesn't have in-app messaging yet, but your preference is saved for when it does.",
    wired: false,
  },
];

export default function NotificationSettings({ userId }: Props) {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotificationPreferences(userId)
      .then(setPrefs)
      .catch(() => setError("Could not load notification preferences."));
    setPushEnabled(!!getStoredPushToken());
  }, [userId]);

  const handleEnablePush = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await enablePushNotifications(userId);
      if (result.status === "enabled") {
        setPushEnabled(true);
      } else if (result.status === "denied") {
        setError("Notifications were blocked. Enable them in your browser's site settings to turn this on.");
      } else {
        setError("Push notifications aren't supported in this browser.");
      }
    } catch {
      setError("Could not enable push notifications right now.");
    } finally {
      setBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setBusy(true);
    try {
      await disablePushNotifications(userId);
      setPushEnabled(false);
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next); // optimistic
    try {
      await updateNotificationPreferences(userId, next);
    } catch {
      setPrefs(prefs); // revert on failure
      setError("Could not save that preference - please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {pushEnabled ? (
          <button
            type="button"
            onClick={handleDisablePush}
            disabled={busy}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
            Turn off
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={busy}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Enable push notifications
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {prefs && (
        <div className="space-y-3">
          {CATEGORY_LABELS.map(({ key, label, description, wired }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={prefs[key]}
                onChange={() => toggleCategory(key)}
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">
                  {label}
                  {!wired && <span className="ml-2 text-xs text-gray-400">(not live yet)</span>}
                </span>
                <span className="block text-xs text-gray-500">{description}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
