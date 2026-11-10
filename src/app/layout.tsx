import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { AppStateProvider } from "@/state/AppState";
import { AppChrome } from "@/components/AppChrome";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isDev = process.env.NODE_ENV !== "production";

// Everything is local: no third-party origins, and network connections only to this site.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // Parent voice recordings are played from on-device blob: URLs.
  "media-src 'self' blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: { default: "Little Ramadan", template: "%s · Little Ramadan" },
  description: "Little Ramadan — My Little Journey of Faith, Kindness & Discovery. A free, child-safe Ramadan learning adventure for children aged 7–9. No ads, no purchases, no accounts.",
  applicationName: "Little Ramadan",
  manifest: `${BASE}/manifest.webmanifest`,
  icons: {
    icon: [{ url: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" }],
    apple: [{ url: `${BASE}/icons/apple-touch-icon.png`, sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "Little Ramadan", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: false },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#123C35",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
      </head>
      <body>
        <AppStateProvider>
          <AppChrome>{children}</AppChrome>
        </AppStateProvider>
      </body>
    </html>
  );
}
