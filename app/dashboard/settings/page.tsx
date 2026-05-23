import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ThemeToggle from "@/components/theme-toggle"

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-on-background">Settings</h1>
      <p className="mb-8 text-on-surface-variant">Customize your experience.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Theme</h2>
              <p className="text-sm text-on-surface-variant">Toggle between light and dark mode.</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-2 text-lg font-semibold text-on-surface">Notifications</h2>
          <p className="text-sm text-on-surface-variant">
            Email notifications are sent for account verification and password reset requests.
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Current email: <span className="font-medium text-on-surface">{user.email}</span>
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-2 text-lg font-semibold text-on-surface">Account</h2>
          <p className="text-sm text-on-surface-variant">
            Signed in as <span className="font-medium text-on-surface">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}