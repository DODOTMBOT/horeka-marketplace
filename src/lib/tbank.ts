const IS_TEST = process.env.TBANK_TEST !== 'false'

const TERMINAL = IS_TEST
  ? (process.env.TBANK_TERMINAL ?? '1779261717054DEMO')
  : (process.env.TBANK_TERMINAL_PROD ?? '1779261717071')

const PASSWORD = IS_TEST
  ? (process.env.TBANK_PASSWORD ?? '')
  : (process.env.TBANK_PASSWORD_PROD ?? '')

const BASE_URL = 'https://securepay.tinkoff.ru/v2'

async function sha256hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function generateToken(params: Record<string, unknown>): Promise<string> {
  const obj: Record<string, unknown> = { ...params, Password: PASSWORD }
  delete obj.Token
  delete obj.Receipt
  delete obj.DATA
  const values = Object.keys(obj).sort().map(k => String(obj[k])).join('')
  return sha256hex(values)
}

export async function initPayment(opts: {
  orderId: string
  amountKopecks: number
  description: string
  successUrl: string
  failUrl: string
  notificationUrl: string
}): Promise<{ paymentId: string; paymentUrl: string } | { error: string }> {
  const body: Record<string, unknown> = {
    TerminalKey: TERMINAL,
    Amount: opts.amountKopecks,
    OrderId: opts.orderId,
    Description: opts.description,
    SuccessURL: opts.successUrl,
    FailURL: opts.failUrl,
    NotificationURL: opts.notificationUrl,
  }
  body.Token = await generateToken(body)

  try {
    const res = await fetch(`${BASE_URL}/Init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let data: Record<string, unknown>
    try {
      data = JSON.parse(text)
    } catch {
      console.error('[tbank] non-JSON response', res.status, text.slice(0, 300))
      return { error: `Платёжный сервис недоступен (HTTP ${res.status})` }
    }
    if (!data.Success) return { error: (data.Message as string) ?? `T-Bank error: ${JSON.stringify(data)}` }
    return { paymentId: String(data.PaymentId), paymentUrl: data.PaymentURL as string }
  } catch (e) {
    console.error('[tbank] fetch error', e)
    return { error: `Ошибка соединения с платёжным сервисом: ${String(e)}` }
  }
}

export async function verifyNotification(params: Record<string, unknown>): Promise<boolean> {
  const received = params.Token as string
  if (!received) return false
  const copy: Record<string, unknown> = { ...params }
  delete copy.Token
  return (await generateToken(copy)) === received
}

export const tbankIsTest = IS_TEST
