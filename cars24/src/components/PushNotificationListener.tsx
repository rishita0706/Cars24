import { useEffect } from "react";
import { toast } from "sonner";
import { listenForForegroundMessages } from "@/lib/pushNotifications";

export default function PushNotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    listenForForegroundMessages((title, body) => {
      toast(title, { description: body });
    }).then((unsub) => {
      if (cancelled) {
        unsub();
      } else {
        unsubscribe = unsub;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
}