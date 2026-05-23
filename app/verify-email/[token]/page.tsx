import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || record.expires < new Date()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-on-background">Invalid or Expired Link</h1>
          <p className="mb-6 text-on-surface-variant">
            This verification link is invalid or has expired.
          </p>
          <Link
            href="/login"
            className="text-primary underline hover:no-underline"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  redirect("/login?verified=true")
}
