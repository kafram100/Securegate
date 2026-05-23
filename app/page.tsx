import { auth } from "@/lib/auth"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <ThemeToggle />
      <h1 className="mb-4 text-4xl font-bold text-on-background">SecureGate</h1>
      <p className="mb-8 text-lg text-on-surface-variant">
        A focused authentication and security app
      </p>
      <div className="flex gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-6 py-3 text-on-primary transition hover:brightness-110"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-6 py-3 text-on-primary transition hover:brightness-110"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-outline px-6 py-3 text-primary transition hover:bg-primary-container"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
