import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { LayoutShell } from "@/components/layout-shell";
import { AuthProvider } from "@/contexts/auth-provider";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

const cormorant = localFont({
  src: [
    {
      path: "./fonts/cormorant-garamond-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = localFont({
  src: [
    {
      path: "./fonts/dm-sans-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body
        className="flex min-h-full flex-col overflow-x-hidden bg-ivory text-soft-black"
        suppressHydrationWarning
      >
        <AuthProvider>
          <FirebaseAnalytics />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
