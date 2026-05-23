import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const filename = `${session.user.email}-${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")

    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

    const imageUrl = `/uploads/${filename}`

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    })

    return NextResponse.json({ image: imageUrl })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}