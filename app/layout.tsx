import type { Metadata } from "next";
import AuthSessionProvider from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureGate",
  description: "A focused authentication and security app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
