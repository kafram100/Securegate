import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params

    const existing = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!existing || existing.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      )
    }

    const body = await request.json()
    const parsed = resetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

    await prisma.user.update({
      where: { email: existing.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
