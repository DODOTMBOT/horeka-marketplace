'use server'

import { getSession } from '@/lib/session'
import { saveDisputeConfig } from '@/lib/disputeConfig'
import { revalidatePath } from 'next/cache'

export type DisputeSettingsState = {
  error?: string
  success?: boolean
}

export async function saveDisputeSettings(
  _prev: DisputeSettingsState,
  formData: FormData
): Promise<DisputeSettingsState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Нет доступа' }

  const disputeDelayHours = parseInt(formData.get('disputeDelayHours') as string, 10)
  const autoCompleteHours = parseInt(formData.get('autoCompleteHours') as string, 10)
  const reviewHours = parseInt(formData.get('reviewHours') as string, 10)
  const minDescriptionLength = parseInt(formData.get('minDescriptionLength') as string, 10)
  const maxFiles = parseInt(formData.get('maxFiles') as string, 10)

  if (isNaN(disputeDelayHours) || disputeDelayHours < 0 || disputeDelayHours > 8760) {
    return { error: 'Задержка перед спором: от 0 до 8760 часов' }
  }
  if (isNaN(autoCompleteHours) || autoCompleteHours < 1 || autoCompleteHours > 8760) {
    return { error: 'Автозавершение: от 1 до 8760 часов' }
  }
  if (isNaN(reviewHours) || reviewHours < 1 || reviewHours > 720) {
    return { error: 'Время рассмотрения: от 1 до 720 часов' }
  }
  if (isNaN(minDescriptionLength) || minDescriptionLength < 10 || minDescriptionLength > 500) {
    return { error: 'Минимальная длина описания: от 10 до 500 символов' }
  }
  if (isNaN(maxFiles) || maxFiles < 1 || maxFiles > 20) {
    return { error: 'Макс. файлов: от 1 до 20' }
  }

  await saveDisputeConfig({ disputeDelayHours, autoCompleteHours, reviewHours, minDescriptionLength, maxFiles })

  revalidatePath('/admin/disputes/settings')
  return { success: true }
}
