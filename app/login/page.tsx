"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Invalid credentials")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <ThemeToggle />
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-3xl font-bold text-on-background">Sign In</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-on-surface">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-outline bg-surface p-3 text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-on-surface">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-outline bg-surface p-3 text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-on-primary transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-on-surface-variant">
          <Link href="/forgot-password" className="hover:underline hover:text-primary">
            Forgot password?
          </Link>
          <Link href="/signup" className="hover:underline hover:text-primary">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
