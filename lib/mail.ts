import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
})

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const from = process.env.SMTP_FROM || "noreply@localhost"
  try {
    const info = await transporter.sendMail({ from, to, subject, html })
    console.log("Email sent:", info.messageId)
    return info
  } catch (err) {
    console.error("SMTP error:", err instanceof Error ? err.message : err)
    throw err
  }
}