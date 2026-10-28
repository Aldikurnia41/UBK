import type { Pagination } from '@sisfo-remake/ui/types'
import type { TestType } from '@/config'
import { djs } from '@/lib/utils'
import { FormType, TEST_TYPE_LABEL } from '@/config'

// ===================== Response (question-bank `/question`) =====================
export interface QuestionResponse {
  id: string
  question: string
  displayQuestion?: string
  /** Nomor bentuk soal (`questionForm.number` di schedule-test `/forms`) */
  formId: number
  formName?: string
  /** `true` untuk bentuk soal yang dinilai manual (essay) */
  manualCorrect: boolean
  testType: 'ujian' | 'kuis'
  difficulty: string
  courseId: number
  subjectId: number | string
  active: boolean
  answers: { id: string; value: string }[]
  answerId?: string | null
  createdAt: string
  updatedAt: string
  course?: { id: number; batchName?: string }
  subject?: { id: number; name: string }
}

/** schedule-test `/forms` */
export interface FormResponse {
  id: number
  name: string
  questionForm: { number: number; text: string }
}

/**
 * Bentuk soal Belneg → nomor bentuk soal Bahasa di backend:
 * Pilihan Ganda = Structure Tipe A (teks, pilihan ganda), Essay = Essay Tipe A.
 */
export const FORM_NUMBER: Record<FormType, number> = {
  [FormType.PilihanGanda]: 1,
  [FormType.Essay]: 7,
}

export const toFormType = (item: Pick<QuestionResponse, 'manualCorrect'>) =>
  item.manualCorrect ? FormType.Essay : FormType.PilihanGanda

// ===================== DTO (UI) =====================
export interface QuestionRow {
  id: string
  question: string
  createdAt: string
  formType: FormType
  testType: string
}

export interface QuestionDetail {
  id: string
  question: string
  formType: FormType
  testType: TestType
  courseId: string
  course: string
  subjectId: string
  subject: string
  difficulty: string
  active: boolean
  options: { id: string; text: string; isCorrect: boolean }[]
}

export const listQuestionDTO = (
  payload: Pagination<QuestionResponse[]>,
  testType: TestType
): Pagination<QuestionRow[]> => ({
  ...payload,
  data: payload.data.map((item) => ({
    id: item.id,
    question: item.displayQuestion ?? item.question,
    createdAt: djs(item.createdAt).format('DD/MM/YYYY'),
    formType: toFormType(item),
    testType: TEST_TYPE_LABEL[testType],
  })),
})

export const detailQuestionDTO = (item: QuestionResponse, testType: TestType): QuestionDetail => ({
  id: item.id,
  question: item.displayQuestion ?? item.question,
  formType: toFormType(item),
  testType,
  courseId: `${item.courseId}`,
  course: item.course?.batchName ?? '-',
  subjectId: `${item.subjectId}`,
  subject: item.subject?.name ?? '-',
  difficulty: item.difficulty,
  active: item.active,
  options: item.manualCorrect
    ? []
    : item.answers.map((answer) => ({
        id: answer.id,
        text: answer.value,
        isCorrect: answer.id === item.answerId,
      })),
})

// ===================== Payload (`POST /question`, `PUT /question/:id`) =====================
export interface QuestionPayload {
  testType: 'ujian' | 'kuis'
  /** `id` bentuk soal dari `/forms` (bukan nomornya), sama seperti Bahasa */
  formId: number
  courseId: number
  subjectId: string
  difficulty: string
  active: boolean
  question: string
  answerIndex?: number
  answers?: { id: string; value: string }[]
}
