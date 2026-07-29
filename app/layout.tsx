import type { Metadata, Viewport } from "next";
import { Fraunces, Kumbh_Sans } from "next/font/google";
import { ProvedorDados } from "@/lib/data/context";
import { OfflineIndicator } from "@/components/demo/OfflineIndicator";
import { DemoControlBar } from "@/components/demo/DemoControlBar";
import "./globals.css";

const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-kumbh-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portonave — Checklist de Pré-Operação",
  description: "Protótipo de demonstração do sistema de checklist de pré-operação de equipamentos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${kumbhSans.variable} ${fraunces.variable} h-full`}>
      <body className="flex h-dvh flex-col overflow-hidden antialiased">
        <ProvedorDados>
          <div className="no-print z-30 shrink-0 border-b border-neutral-100 bg-white">
            <OfflineIndicator />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <DemoControlBar />
        </ProvedorDados>
      </body>
    </html>
  );
}
