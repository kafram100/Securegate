import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { image } = await request.json()

    if (typeof image !== "string") {
      return NextResponse.json({ error: "Image must be a string URL" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { image },
    })

    return NextResponse.json({ image: user.image })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}