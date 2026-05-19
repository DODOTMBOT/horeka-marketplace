import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM ?? `HoReCa Hub <${process.env.SMTP_USER}>`
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unit-one.ru'

export async function sendEmail({
  to,
  subject,
  title,
  body,
  link,
  linkLabel = 'Открыть',
}: {
  to: string
  subject: string
  title: string
  body: string
  link?: string
  linkLabel?: string
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f8fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eaecf2">
    <div style="background:#f97316;padding:24px 32px">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.3px">HoReCa Hub</p>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a1d23">${title}</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#8b92a5;line-height:1.6">${body}</p>
      ${link ? `<a href="${BASE_URL}${link}" style="display:inline-block;padding:12px 28px;background:#f97316;color:#fff;border-radius:50px;font-size:14px;font-weight:700;text-decoration:none">${linkLabel}</a>` : ''}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #eaecf2">
      <p style="margin:0;font-size:12px;color:#8b92a5">Вы получили это письмо, так как зарегистрированы на HoReCa Hub</p>
    </div>
  </div>
</body>
</html>`

  try {
    await transporter.sendMail({ from: FROM, to, subject, html })
  } catch (e) {
    console.error('[email] send failed:', e)
  }
}
