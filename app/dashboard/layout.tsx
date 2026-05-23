import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import ThemeToggle from "@/components/theme-toggle"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Profile", href: "/dashboard/profile", icon: "◎" },
  { label: "Security", href: "/dashboard/security", icon: "⚉" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth?mode=login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user?.emailVerified) {
    redirect("/auth?mode=login&error=verify")
  }

  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-outline-variant bg-surface p-6 md:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">S</div>
          <span className="text-lg font-bold text-on-surface">SecureGate</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-variant hover:text-on-surface"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-outline-variant bg-surface px-6 py-4">
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">S</div>
          </div>

          <h2 className="hidden text-lg font-semibold text-on-surface md:block">SecureGate</h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img src={user.image} alt="" className="size-9 rounded-full border-2 border-outline-variant object-cover" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {initial}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-on-surface">{user.name ?? user.email}</p>
                <p className="text-xs text-on-surface-variant">{user.email}</p>
              </div>
            </div>

            <div className="h-6 w-px bg-outline-variant" />

            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/auth?mode=login" })
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-on-error transition hover:brightness-110"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}