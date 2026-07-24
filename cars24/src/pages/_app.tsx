import Fotter from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LocationProvider>
        <Header />
        <Component {...pageProps} />
        <Fotter />
        <Toaster richColors />
      </LocationProvider>
    </AuthProvider>
  );
}