import { auth } from "@/lib/auth"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import HeroCarousel from "@/components/hero-carousel"

export default async function Home() {
  const session = await auth()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <HeroCarousel />
      <ThemeToggle />
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white drop-shadow-lg">
          SecureGate
        </h1>
        <p className="mb-8 text-xl text-white/80 drop-shadow">
          A focused authentication and security app
        </p>
        <div className="flex justify-center gap-4">
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
                href="/auth?mode=login"
                className="rounded-lg bg-primary px-6 py-3 text-on-primary transition hover:brightness-110"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-white transition hover:bg-white/20 backdrop-blur-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
