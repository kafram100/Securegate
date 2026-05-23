"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import ThemeToggle from "@/components/theme-toggle"

type AuthMode = "login" | "signup" | "forgot" | "reset"
type FieldErrors = { name?: string; email?: string; password?: string }

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get("mode") as AuthMode) || "login"
  const resetToken = searchParams.get("token") || ""

  const [activeMode, setActiveMode] = useState<AuthMode>(mode)
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "strong" | "">("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setActiveMode(mode)
    setServerError("")
    setSuccessMessage("")
    setTouched({})
    setFieldErrors({})
  }, [mode])

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setActiveMode("login")
      setSuccessMessage("Email verified! You can now sign in.")
    }
    if (searchParams.get("error") === "verify") {
      setActiveMode("login")
      setServerError("Please verify your email before accessing the dashboard.")
    }
  }, [searchParams])

  const tabs: { key: AuthMode; label: string }[] = [
    { key: "login", label: "Sign In" },
    { key: "signup", label: "Sign Up" },
  ]

  function switchMode(newMode: AuthMode) {
    const params = new URLSearchParams()
    params.set("mode", newMode)
    if (newMode === "reset" && resetToken) params.set("token", resetToken)
    router.push(`/auth?${params.toString()}`)
  }

  function validateField(name: string, value: string): string {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return ""
      case "email":
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address"
        return ""
      case "password":
        if (!value) return "Password is required"
        if (value.length < 8) return "Password must be at least 8 characters"
        if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter"
        if (!/[0-9]/.test(value)) return "Password must include a number"
        return ""
      default:
        return ""
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
    if (name === "password") {
      checkStrength(value)
    }
  }

  function checkStrength(password: string) {
    if (password.length < 8) {
      setPasswordStrength("")
    } else if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      setPasswordStrength("strong")
    } else if (password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password))) {
      setPasswordStrength("fair")
    } else {
      setPasswordStrength("weak")
    }
  }

  function validateAll(form: HTMLFormElement): boolean {
    const data = new FormData(form)
    const name = (data.get("name") as string) || ""
    const email = (data.get("email") as string) || ""
    const password = (data.get("password") as string) || ""

    const errors: FieldErrors = {
      name: activeMode === "signup" ? validateField("name", name) : undefined,
      email: activeMode !== "reset" ? validateField("email", email) : undefined,
      password: activeMode !== "forgot" ? validateField("password", password) : undefined,
    }

    setFieldErrors(errors)
    setTouched({ name: true, email: true, password: true })

    return !errors.name && !errors.email && !errors.password
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError("")
    setSuccessMessage("")
    if (!validateAll(e.currentTarget)) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string
    const name = form.get("name") as string

    try {
      if (activeMode === "login") {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          setServerError("Invalid credentials")
          return
        }
        router.push("/dashboard")
        router.refresh()
      } else if (activeMode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setServerError(data.error ?? "Something went wrong")
          return
        }
        setSuccessMessage(data.message)
      } else if (activeMode === "forgot") {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) {
          setServerError(data.error ?? "Something went wrong")
          return
        }
        setSuccessMessage(data.message)
      } else if (activeMode === "reset") {
        const res = await fetch(`/api/reset-password/${resetToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setServerError(data.error ?? "Something went wrong")
          return
        }
        setSuccessMessage("Password reset successfully!")
        setTimeout(() => {
          const params = new URLSearchParams()
          params.set("mode", "login")
          router.push(`/auth?${params.toString()}`)
        }, 2000)
      }
    } catch {
      setServerError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function inputClass(field: string) {
    const hasError = touched[field] && fieldErrors[field as keyof FieldErrors]
    return `w-full rounded-lg border bg-surface p-3 text-on-surface placeholder:text-on-surface-variant outline-none transition ${
      hasError ? "border-warning" : "border-outline focus:border-primary"
    }`
  }

  function inputProps(field: string, extra: Record<string, string> & { className?: string } = {}) {
    const hasError = touched[field] && fieldErrors[field as keyof FieldErrors]
    const errorId = `${field}-error`
    const { className: extraClass, ...rest } = extra
    return {
      className: [inputClass(field), extraClass].filter(Boolean).join(" "),
      "aria-invalid": hasError ? ("true" as const) : ("false" as const),
      "aria-describedby": hasError ? errorId : undefined,
      ...rest,
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <ThemeToggle />
      <div className="w-full max-w-sm">
        {activeMode === "login" || activeMode === "signup" ? (
          <div className="mb-6 flex rounded-lg bg-surface-variant p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchMode(tab.key)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeMode === tab.key
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <h1 className="mb-6 text-3xl font-bold text-primary">
            {activeMode === "forgot" ? "Forgot Password" : "Reset Password"}
          </h1>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {activeMode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-on-surface">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                spellCheck={false}
                onBlur={handleBlur}
                onChange={handleChange}
                {...inputProps("name")}
              />
              {touched.name && fieldErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-warning" role="alert">{fieldErrors.name}</p>
              )}
            </div>
          )}

          {activeMode !== "reset" && (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-on-surface">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                onBlur={handleBlur}
                onChange={handleChange}
                {...inputProps("email")}
              />
              {touched.email && fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-warning" role="alert">{fieldErrors.email}</p>
              )}
            </div>
          )}

          {activeMode !== "forgot" && (
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-on-surface">
                {activeMode === "reset" ? "New Password (min. 8 characters)" : "Password (min. 8 characters)"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={activeMode === "reset" ? "new-password" : "current-password"}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  {...inputProps("password", { className: "pr-10" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-warning" role="alert">{fieldErrors.password}</p>
              )}
              {passwordStrength && !fieldErrors.password && activeMode === "signup" && (
                <p className={`mt-1 text-sm ${
                  passwordStrength === "strong" ? "text-success" : "text-warning"
                }`} role="status">Password strength: {passwordStrength}</p>
              )}
            </div>
          )}

          {serverError && <p className="text-sm text-warning">{serverError}</p>}
          {successMessage && <p className="text-sm text-success">{successMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-on-primary transition hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? activeMode === "login"
                ? "Signing in..."
                : activeMode === "signup"
                  ? "Creating account..."
                  : activeMode === "forgot"
                    ? "Sending..."
                    : "Resetting..."
              : activeMode === "login"
                ? "Sign In"
                : activeMode === "signup"
                  ? "Create Account"
                  : activeMode === "forgot"
                    ? "Send Reset Link"
                    : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm text-on-surface-variant">
          {activeMode === "login" && (
            <>
              <button type="button" onClick={() => switchMode("forgot")} className="text-left hover:underline hover:text-primary">Forgot password?</button>
              <button type="button" onClick={() => switchMode("signup")} className="text-left hover:underline hover:text-primary">Don&apos;t have an account? Sign up</button>
            </>
          )}
          {activeMode === "signup" && (
            <button type="button" onClick={() => switchMode("login")} className="text-left hover:underline hover:text-primary">Already have an account? Sign in</button>
          )}
          {(activeMode === "forgot" || activeMode === "reset") && (
            <button type="button" onClick={() => switchMode("login")} className="text-left hover:underline hover:text-primary">Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}