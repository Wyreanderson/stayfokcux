import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RegistrarSW } from "@/components/shared/RegistrarSW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "stayfokcux — Seu fluxo. Sua oficina. Seu controle.",
  description:
    "Organização inteligente de tarefas para almoxarifado e oficina. Capture por voz ou texto, deixe a IA priorizar.",
  manifest: "/manifest.webmanifest",
  applicationName: "stayfokcux",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "stayfokcux",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a2e28",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
