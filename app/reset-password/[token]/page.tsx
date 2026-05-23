"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const token = params.token as string

    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        return
      }

      setMessage("Password reset successfully!")
      setTimeout(() => router.push("/login"), 2000)
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
        <h1 className="mb-6 text-3xl font-bold text-on-background">Reset Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-on-surface">
              New Password (min. 8 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-outline bg-surface p-3 text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          {message && <p className="text-sm text-tertiary">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-on-primary transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="mt-4 text-sm text-on-surface-variant">
          <Link href="/login" className="hover:underline text-primary">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
