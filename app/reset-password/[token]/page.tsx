import { redirect } from "next/navigation"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  redirect(`/auth?mode=reset&token=${token}`)
}