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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem("theme");
                var root = document.documentElement;
                if (theme === "dark") {
                  root.classList.add("dark");
                  root.classList.remove("light");
                } else if (theme === "light") {
                  root.classList.add("light");
                  root.classList.remove("dark");
                } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                  root.classList.add("dark");
                  root.classList.remove("light");
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
