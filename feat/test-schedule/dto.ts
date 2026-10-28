import type { Pagination } from '@sisfo-remake/ui/types'
import type { TestType } from '@/config'
import { djs } from '@/lib/utils'
import { FormType, TEST_TYPE_LABEL, toTestType } from '@/config'

// ===================== Response (schedule-test) =====================
export interface TestScheduleResponse {
  id: number
  batchId?: number
  sessionId: number
  subjectId?: number
  /** `YYYY-MM-DD` */
  date: string
  /** `HH:mm:ss` */
  startTime: string
  endTime: string
  /** Menit */
  duration: number
  /** `Kuis` | `Ujian` | `Ujian Masuk` | `Seleksi Kelas` */
  type: string
  token: string | null
  status: 'past' | 'present' | 'future'
  isCalculated: boolean
  isLocked?: boolean
  isManualCorrection?: boolean
  /** Format soal (bentuk soal + jumlah) — hanya ada di detail jadwal */
  questionServeds?: { formId: number }[]
  totalQuestions?: number
  realTotalStudent?: number
  batch?: BatchResponse
  session?: {
    subjectId?: number
    room?: string
    subject?: { id: number; name: string }
    teacher?: { fullName?: string }
    schedule?: { batch?: BatchResponse; classroomId?: number | null }
  }
}

export interface BatchResponse {
  id: number
  name: string
  courseId: number
  course?: { id?: number; batchName?: string }
}

// ===================== DTO (UI) =====================
export interface TestScheduleRow {
  id: number
  course: string
  subject: string
  questionSet: string
  testType: string
  formType: string
  author: string
  startAt: string
  endAt: string
  duration: string
  /** Jadwal yang sudah dimulai tidak dapat diubah/dihapus */
  isStarted: boolean
}

export interface TestScheduleDetail {
  id: number
  batchId: string
  courseId: string
  classroomId: string
  subjectId: string
  course: string
  subject: string
  questionSet: string
  testType?: TestType
  testTypeLabel: string
  formType: string
  startAt: string
  endAt: string
  startAtLabel: string
  endAtLabel: string
  duration: number
  author: string
  token: string
  totalQuestions: number
  isCalculated: boolean
  isLocked: boolean
  isStarted: boolean
}

export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss'
export const DATE_TIME_LONG_FORMAT = 'DD MMMM YYYY HH:mm:ss'

export const batchLabel = (batch?: BatchResponse) =>
  batch ? `${batch.course?.batchName ?? ''} - ${batch.name}`.replace(/^ - /, '') : '-'

const toDateTime = (date: string, time: string) => djs(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss')

const testTypeLabel = (type: string) => {
  const testType = toTestType(type)
  return testType ? TEST_TYPE_LABEL[testType] : type
}

/** Backend tidak punya "set soal" bernama — Soal ditampilkan sesuai tipe tes */
const questionSetLabel = (type: string) => `Soal ${testTypeLabel(type)}`

/** Figma: Pilihan Ganda / Essay / Gabungan (campuran keduanya) */
const formTypeLabel = (item: TestScheduleResponse) => {
  const hasMultipleForms = new Set(item.questionServeds?.map((served) => served.formId)).size > 1
  if (item.isManualCorrection && hasMultipleForms) return 'Gabungan'
  return item.isManualCorrection ? FormType.Essay : FormType.PilihanGanda
}

export const toScheduleRow = (item: TestScheduleResponse): TestScheduleRow => {
  const batch = item.batch ?? item.session?.schedule?.batch
  return {
    id: item.id,
    course: batchLabel(batch),
    subject: item.session?.subject?.name ?? '-',
    questionSet: questionSetLabel(item.type),
    testType: testTypeLabel(item.type),
    formType: formTypeLabel(item),
    author: item.session?.teacher?.fullName ?? '-',
    startAt: toDateTime(item.date, item.startTime).format(DATE_TIME_FORMAT),
    endAt: toDateTime(item.date, item.endTime).format(DATE_TIME_FORMAT),
    duration: `${item.duration} Menit`,
    isStarted: item.status !== 'future',
  }
}

export const listTestScheduleDTO = (
  payload: Pagination<TestScheduleResponse[]>
): Pagination<TestScheduleRow[]> => ({
  ...payload,
  data: payload.data.map(toScheduleRow),
})

export const detailTestScheduleDTO = (item: TestScheduleResponse): TestScheduleDetail => {
  const batch = item.batch ?? item.session?.schedule?.batch
  const startAt = toDateTime(item.date, item.startTime)
  const endAt = toDateTime(item.date, item.endTime)
  return {
    id: item.id,
    batchId: `${batch?.id ?? item.batchId ?? ''}`,
    courseId: `${batch?.courseId ?? ''}`,
    classroomId: `${item.session?.schedule?.classroomId ?? ''}`,
    subjectId: `${item.session?.subject?.id ?? item.subjectId ?? ''}`,
    course: batchLabel(batch),
    subject: item.session?.subject?.name ?? '-',
    questionSet: questionSetLabel(item.type),
    testType: toTestType(item.type),
    testTypeLabel: testTypeLabel(item.type),
    formType: formTypeLabel(item),
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    startAtLabel: startAt.format(DATE_TIME_LONG_FORMAT),
    endAtLabel: endAt.format(DATE_TIME_LONG_FORMAT),
    duration: item.duration,
    author: item.session?.teacher?.fullName ?? '-',
    token: item.token ?? '',
    totalQuestions: item.totalQuestions ?? 0,
    isCalculated: item.isCalculated,
    isLocked: item.isLocked ?? false,
    isStarted: item.status !== 'future',
  }
}

// ===================== Payload =====================
/** Data form Jadwal Tes yang diterjemahkan menjadi sesi jadwal akademik (weekly-schedule.ts) */
export interface TestSchedulePayload {
  batchId: number
  /** Wajib untuk Kuis & Posttest (sesi Kuis/Ujian di jadwal akademik terikat kelas) */
  classroomId?: number
  subjectId: number
  /** Tipe jadwal backend: `Ujian Masuk` | `Ujian` | `Kuis` */
  type: string
  /** `YYYY-MM-DD` */
  date: string
  /** `HH:mm` */
  startTime: string
  endTime: string
}
