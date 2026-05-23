import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">SecureGate</h1>
      <p className="mb-8 text-lg text-gray-600">
        A focused authentication and security app
      </p>
      <div className="flex gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-black px-6 py-3 text-black transition hover:bg-gray-100"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
