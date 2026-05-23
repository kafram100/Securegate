import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  })

  if (!user) return null

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(user.createdAt)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold text-on-background">
        Welcome back, {user.name?.split(" ")[0] ?? "there"}
      </h1>
      <p className="mb-8 text-on-surface-variant">Here&apos;s what&apos;s happening with your account.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            ◎
          </div>
          <p className="text-sm text-on-surface-variant">Account</p>
          <p className="text-lg font-semibold text-on-surface">Active</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
            ⚉
          </div>
          <p className="text-sm text-on-surface-variant">Verification</p>
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-full ${user.emailVerified ? "bg-success" : "bg-warning"}`} />
            <p className="text-lg font-semibold text-on-surface">
              {user.emailVerified ? "Verified" : "Pending"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6 sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-tertiary-container text-on-tertiary-container">
            🕐
          </div>
          <p className="text-sm text-on-surface-variant">Member since</p>
          <p className="text-lg font-semibold text-on-surface">{joinedDate}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-outline-variant bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-on-surface">Profile Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-on-surface-variant">Full Name</p>
            <p className="font-medium text-on-surface">{user.name ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Email</p>
            <p className="font-medium text-on-surface">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Email Verified</p>
            <p className={`font-medium ${user.emailVerified ? "text-success" : "text-warning"}`}>
              {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Joined</p>
            <p className="font-medium text-on-surface">{joinedDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}