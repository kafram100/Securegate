import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ThemeToggle from "@/components/theme-toggle"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user?.emailVerified) {
    redirect("/login?error=verify")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <ThemeToggle />
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-on-background">Dashboard</h1>
        <div className="mb-6 rounded-lg border border-outline-variant bg-surface p-6">
          <p className="text-lg text-on-surface">
            Welcome, <strong>{user.name ?? user.email}</strong>
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">Email: {user.email}</p>
          <p className="text-sm text-on-surface-variant">
            Verified: {user.emailVerified ? "Yes" : "No"}
          </p>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 text-on-primary transition hover:brightness-110"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
