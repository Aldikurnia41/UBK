import type { Pagination } from '@sisfo-remake/ui/types'
import { djs } from '@/lib/utils'
import { FormType, PASSING_SCORE } from '@/config'

// ===================== Response (API contract) =====================
// Mengikuti service `assessment-ubk` (model WorkTest, Answer, AnswerScore).

/** `GET /work-test/schedule/:scheduleId` — item pengerjaan tes per siswa */
export interface WorktestResponse {
  id: number
  scheduleId: number
  studentCourseId: number
  /** Nilai akhir skala 0–100, dihitung oleh `POST /work-test/:id/calculate` */
  score: number
  /** 'Not Start' | 'Working' | 'Finished' | 'Not Taken' */
  status: string
  /** `true` setelah nilai pengerjaan dihitung ulang (seluruh jawaban sudah dinilai) */
  isCalculated: boolean
  /** Backend belum menyimpan jam mulai/selesai; FE memakai `createdAt`/`updatedAt` */
  createdAt: string
  updatedAt: string
  studentCourse?: {
    id: number
    studentId?: string
    student?: { profile?: { fullName?: string } }
  }
}

/** `GET /answer-scores/work-test/:workTestId` — soal + jawaban siswa + skor */
export interface AnswerScoreItemResponse {
  id: string
  question: string
  /** Opsi jawaban (pilihan ganda) */
  answers?: { id: string; value: string }[]
  /** Id opsi jawaban yang benar */
  answerId?: string | null
  formId: number
  /** Tingkat kesulitan (Grade) — tidak dipakai Belneg */
  difficulty?: string
  /** `true` untuk soal yang dinilai manual (essay) */
  manualCorrect: boolean
  answer?: {
    id: number
    /** Pilihan ganda: id opsi terpilih. Essay: teks jawaban. Bentuk lain Bahasa: array */
    answer: string | { value?: string; answer?: string }[] | null
    answerScore?: { score: number | null } | null
  } | null
}

// ===================== DTO (UI) =====================
export interface WorktestRow {
  id: number
  scheduleId: number
  studentName: string
  workDate: string
  startTime: string
  endTime: string
  isGraded: boolean
  score: number
}

export interface ResultRow {
  id: number
  studentName: string
  score: number
  isPassed: boolean
}

export interface ScoredQuestion {
  id: string
  /** Id record jawaban siswa, dipakai untuk `POST /answer-scores` */
  answerId: number | null
  question: string
  weight: number
  type: FormType
  answer: string
  /** Poin yang diperoleh (0 – bobot); `null` jika belum dinilai */
  score: number | null
  options: { id: string; text: string; isCorrect: boolean; isSelected: boolean }[]
}

export interface WorktestDetail {
  id: number
  studentName: string
  isGraded: boolean
  score: number
  questions: ScoredQuestion[]
}

const studentName = (item: WorktestResponse) =>
  item.studentCourse?.student?.profile?.fullName ?? '-'

/** Skor per butir di assessment-ubk berskala 0–1 (sama seperti Bahasa) */
export const QUESTION_MAX_SCORE = 1

export const toWorktestRow = (item: WorktestResponse): WorktestRow => {
  const startedAt = item.createdAt
  const finishedAt = item.updatedAt
  return {
    id: item.id,
    scheduleId: item.scheduleId,
    studentName: studentName(item),
    workDate: djs(startedAt).format('YYYY-MM-DD'),
    startTime: djs(startedAt).format('YYYY-MM-DD HH:mm:ss'),
    endTime: djs(finishedAt).format('YYYY-MM-DD HH:mm:ss'),
    isGraded: item.isCalculated,
    score: item.score,
  }
}

export const listWorktestDTO = (
  payload: Pagination<WorktestResponse[]>
): Pagination<WorktestRow[]> => ({
  ...payload,
  data: payload.data.map(toWorktestRow),
})

export const listResultDTO = (
  payload: Pagination<WorktestResponse[]>
): Pagination<ResultRow[]> => ({
  ...payload,
  data: payload.data.map((item) => ({
    id: item.id,
    studentName: studentName(item),
    score: item.score,
    isPassed: item.score >= PASSING_SCORE,
  })),
})

export const detailWorktestDTO = (
  worktest: WorktestResponse,
  items: AnswerScoreItemResponse[]
): WorktestDetail => ({
  id: worktest.id,
  studentName: studentName(worktest),
  isGraded: worktest.isCalculated,
  score: worktest.score,
  questions: items.map((item) => {
    const raw = item.answer?.answer
    const selected = Array.isArray(raw)
      ? raw.map((part) => part.answer ?? part.value ?? '').join(' ')
      : (raw ?? '')
    return {
      id: item.id,
      answerId: item.answer?.id ?? null,
      question: item.question,
      weight: QUESTION_MAX_SCORE,
      type: item.manualCorrect ? FormType.Essay : FormType.PilihanGanda,
      answer: selected,
      score: item.answer?.answerScore?.score ?? null,
      options: (item.answers ?? []).map((option) => ({
        id: option.id,
        text: option.value,
        isCorrect: option.id === item.answerId,
        isSelected: option.id === selected,
      })),
    }
  }),
})

// ===================== Payload =====================
/** `POST /answer-scores/bulk` — skor 0–1 per jawaban */
export interface AnswerScorePayload {
  answerId: number
  score: number
}
