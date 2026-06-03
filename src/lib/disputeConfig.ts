import { prisma } from './prisma'

export interface DisputeConfig {
  disputeDelayHours: number      // hours after payment before dispute can be opened
  autoCompleteHours: number      // hours after work started before auto-complete
  reviewHours: number            // promised review time shown to user in notification
  minDescriptionLength: number   // min chars in dispute description
  maxFiles: number               // max file uploads per dispute
}

const DEFAULTS: DisputeConfig = {
  disputeDelayHours: 48,
  autoCompleteHours: 48,
  reviewHours: 24,
  minDescriptionLength: 20,
  maxFiles: 5,
}

const KEY = 'dispute_config'

export async function getDisputeConfig(): Promise<DisputeConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: KEY } })
    if (!row) return DEFAULTS
    const stored = row.value as Partial<DisputeConfig>
    return { ...DEFAULTS, ...stored }
  } catch {
    return DEFAULTS
  }
}

export async function saveDisputeConfig(data: Partial<DisputeConfig>): Promise<void> {
  const current = await getDisputeConfig()
  const merged = { ...current, ...data }
  await prisma.siteConfig.upsert({
    where: { key: KEY },
    update: { value: merged },
    create: { key: KEY, value: merged },
  })
}
