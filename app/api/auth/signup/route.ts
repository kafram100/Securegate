import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateToken, addMinutes } from "@/lib/utils"
import { sendMail } from "@/lib/mail"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      )
    }

    const token = generateToken()
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

    await sendMail({
      to: email,
      subject: "Verify your email address",
      html: `<p>Hi ${name},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email. This link expires in 15 minutes.</p>`,
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: addMinutes(15),
      },
    })

    return NextResponse.json(
      { message: "Account created. Check your email to verify." },
      { status: 201 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
