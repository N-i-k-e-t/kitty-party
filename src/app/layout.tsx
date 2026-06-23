import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { HydrateStores } from "@/components/client/HydrateStores";
import { RegisterServiceWorker } from "@/components/client/RegisterServiceWorker";
import { RootProviders } from "@/components/layout/RootProviders";
import { Toaster } from "@/components/ui/Toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saheli — Your personal gathering planner",
  description:
    "Plan unforgettable kitty parties and women’s gatherings with a warm, local-first planner.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Saheli",
  },
};

export const viewport: Viewport = {
  themeColor: "#E6C79C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className={`${inter.className} min-h-dvh`}>
        <RootProviders>
          <HydrateStores />
          <RegisterServiceWorker />
          {children}
          <Toaster />
        </RootProviders>
      </body>
    </html>
  );
}
