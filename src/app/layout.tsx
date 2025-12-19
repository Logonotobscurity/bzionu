
import type { Metadata } from "next";
import "./globals.css";
import "@/styles/focus-visible.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { ClientChatWidget } from "@/components/layout/ClientChatWidget";
import { CookieBanner } from "@/components/cookie-banner";
import WhatsappWidget from "@/components/layout/WhatsappWidget";
import { MonitoringProvider } from "@/components/layout/MonitoringProvider";
import { PageLoadingProvider } from "@/components/layout/PageLoadingProvider";
import NewsletterPopup from "@/components/newsletter-popup";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "BZION Hub Digital",
  description: "Your one-stop B2B platform for Fast-Moving Consumer Goods.",
  icons: {
    icon: "https://i.ibb.co/tp7n1sG7/faicon.png",
    apple: "https://i.ibb.co/tp7n1sG7/faicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen overflow-x-hidden bg-white">
        <Providers>
          <PageLoadingProvider>
            <MonitoringProvider />
            <ErrorBoundary>
              <Header />
              <main id="main-content" className="flex-grow pt-0">{children}</main>
              <Footer />
              <Toaster />
              <WhatsappWidget />
              <ClientChatWidget />
              <CookieBanner />
              <NewsletterPopup delay={10000} />
            </ErrorBoundary>
          </PageLoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
