import type { OptionValue } from '@/type'
import { FormType } from '@/config'

// Bentuk soal UBK Bela Negara (nomor mengikuti `questionForm.number` dari API)
export const QUESTION_FORM = {
  PILIHAN_GANDA: { value: '1', label: FormType.PilihanGanda },
  ESSAY: { value: '2', label: FormType.Essay },
} as const

export const QUESTION_FORM_OPTIONS: OptionValue[] = Object.values(QUESTION_FORM).map(
  ({ value, label }) => ({ value, label })
)
