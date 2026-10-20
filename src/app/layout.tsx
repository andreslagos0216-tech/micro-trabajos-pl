import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ConfirmGate } from "@/components/confirm-gate";
import { Analytics } from "@/components/analytics";
import { MobileNav } from "@/components/mobile-nav";
import { InstallBanner } from "@/components/install-banner";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "TaskGo: anuncios y empleo en Polonia", template: "%s · TaskGo" },
  description: "Ogłoszenia o pracy i usługach w Polsce. Praca dorywcza, na godziny i usługi między osobami prywatnymi.",
  applicationName: "TaskGo",
  appleWebApp: {
    capable: true,
    title: "TaskGo: anuncios y empleo en Polonia",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col pb-24 md:pb-0">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />}>
          <SiteHeader />
        <ConfirmGate />
        <MobileNav />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
        <SwRegister />
        <InstallBanner />
      </body>
    </html>
  );
}
