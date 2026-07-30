import Fotter from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import PushNotificationListener from "@/components/PushNotificationListener";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LocationProvider>
        <Header />
        <Component {...pageProps} />
        <Fotter />
        <Toaster richColors />
        <PushNotificationListener />
      </LocationProvider>
    </AuthProvider>
  );
}
