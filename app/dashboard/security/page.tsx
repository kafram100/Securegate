import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function SecurityPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-on-background">Security</h1>
      <p className="mb-8 text-on-surface-variant">Manage your account security settings.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Password</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Reset your password if you&apos;ve forgotten it or want to update it.
          </p>
          <Link
            href="/auth?mode=forgot"
            className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition hover:brightness-110"
          >
            Change Password
          </Link>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Email Verification</h2>
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2.5 rounded-full ${user.emailVerified ? "bg-success" : "bg-warning"}`} />
            <p className="text-on-surface">
              Email is{" "}
              <strong className={user.emailVerified ? "text-success" : "text-warning"}>
                {user.emailVerified ? "verified" : "not verified"}
              </strong>
            </p>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">{user.email}</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Account Security</h2>
          <p className="text-sm text-on-surface-variant">
            Your password is hashed with bcrypt (12 salt rounds) before being stored.
            Sessions use encrypted JWT tokens with a rotating secret.
          </p>
        </div>
      </div>
    </div>
  )
}