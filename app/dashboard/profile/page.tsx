"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (session?.user?.image) {
      setPreview(session.user.image)
    }
  }, [session])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be under 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    setMessage("")
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setMessage("Please select an image first")
      return
    }

    setUploading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/user/profile/image", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed")
        return
      }

      await update()
      setMessage("Profile picture updated!")
      setTimeout(() => setMessage(""), 3000)
    } catch {
      setMessage("Something went wrong")
    } finally {
      setUploading(false)
    }
  }

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-on-background">Profile</h1>
      <p className="mb-8 text-on-surface-variant">Manage your personal information.</p>

      <div className="rounded-xl border border-outline-variant bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="size-16 rounded-full border-2 border-outline-variant object-cover"
              onError={() => setPreview("")}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-on-primary">
              {initial}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-on-surface">{session?.user?.name ?? "Unnamed"}</h2>
            <p className="text-sm text-on-surface-variant">{session?.user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium text-on-surface">
              Profile Picture
            </label>
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full rounded-lg border border-outline bg-surface p-3 text-on-surface file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-on-primary"
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              Upload an image from your device (max 5MB)
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message === "Profile picture updated!" ? "text-success" : "text-warning"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition hover:brightness-110 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Picture"}
          </button>
        </div>
      </div>
    </div>
  )
}