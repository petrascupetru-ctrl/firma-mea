import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "./components/AppShell";
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
};

export const viewport: Viewport = {
  themeColor: "#0a0b12",
  width: "device-width",
  initialScale: 1,
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
        </StoreProvider>
      </body>
    </html>
  );
}
