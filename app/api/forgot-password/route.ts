import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken, addMinutes } from "@/lib/utils"
import { rateLimit } from "@/lib/rate-limit"
import { sendMail } from "@/lib/mail"

const limiter = rateLimit({ interval: 10 * 60 * 1000, max: 5 })

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const result = limiter.check(ip)

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 },
    )
  }

  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const token = generateToken()

      await prisma.passwordResetToken.create({
        data: { email, token, expires: addMinutes(60) },
      })

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth?mode=reset&token=${token}`
      await sendMail({
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      })
    }

    return NextResponse.json(
      { message: "If that email is registered, a reset link has been sent." },
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
