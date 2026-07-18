import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "./components/AppShell";
import { Pwa } from "./components/Pwa";
import { StoreProvider } from "./lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Debt Manager Pro — Administrarea împrumuturilor",
  description:
    "Aplicație premium pentru administrarea banilor împrumutați: persoane, împrumuturi, plăți, scadențe, rapoarte și notificări.",
  applicationName: "Debt Manager Pro",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Debt Manager Pro",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Applies the persisted theme before paint to avoid a flash.
const themeScript = `
(function(){
  try {
    var raw = localStorage.getItem('debt-manager-pro:v1');
    var theme = 'dark';
    if (raw) { var s = JSON.parse(raw); if (s && s.settings && s.settings.theme) theme = s.settings.theme; }
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      data-theme="dark"
      className={`${geistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Pwa />
        </StoreProvider>
      </body>
    </html>
  );
}
