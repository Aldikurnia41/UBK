// Jadwal tes di backend UBK tidak dibuat langsung: schedule-test membuat jadwal tes dari sesi
// jadwal akademik (service `schedule`, `/weekly-schedule`) berkategori Kuis / Ujian / Ujian Masuk.
// Modul ini menerjemahkan form Jadwal Tes Belneg menjadi sesi jadwal akademik tersebut.
import type { Pagination } from '@sisfo-remake/ui/types'
import type { TestSchedulePayload } from '@/feat/test-schedule/dto'
import { djs } from '@/lib/utils'
import { apiCourses, apiSchedule, apiScheduleTest } from '@/lib/axios'
import { RoutesApi } from '@/config'

const WEEKLY_SCHEDULE = '/weekly-schedule'
const WEEKLY_SCHEDULES = '/weekly-schedules'
const SESSION = '/session'
/** Hanya sesi Ujian Masuk (Pretest) yang menerima `totalStudent` */
const ENTRANCE_EXAM = 'Ujian Masuk'
const DEFAULT_DESCRIPTION = 'Jadwal Tes UBK Bela Negara'

interface SessionResponse {
  id: number
  scheduleId: number
  subjectId: number
  category: string
  /** `HH:mm:ss` */
  startTime: string
  endTime: string
  numStartTime: number
  numEndTime: number
  totalStudent?: number | null
  teacherId: string
  room?: string | null
  description?: string | null
}

interface WeeklyScheduleResponse {
  id: number
  week: number
  date: string
  batchId: number
  classroomId: number | null
  description?: string | null
  sessions: SessionResponse[]
}

interface SessionPayload {
  id?: number
  subjectId: number
  category: string
  /** `HH:mm` */
  startTime: string
  endTime: string
  numStartTime: number
  numEndTime: number
  totalStudent?: number
  teacherId: string
  room: string
  description: string
}

/** Backend menolak string kosong untuk `room`/`description` */
const orFallback = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback
  return value
}

/** Pesan error dengan status agar ditampilkan apa adanya ke pengguna */
export class ScheduleRuleError extends Error {}

const toSessionPayload = (session: SessionResponse): SessionPayload => ({
  id: session.id,
  subjectId: session.subjectId,
  category: session.category,
  startTime: session.startTime.slice(0, 5),
  endTime: session.endTime.slice(0, 5),
  numStartTime: session.numStartTime,
  numEndTime: session.numEndTime,
  ...(session.category === ENTRANCE_EXAM && { totalStudent: session.totalStudent ?? 1 }),
  teacherId: session.teacherId,
  room: orFallback(session.room, '-'),
  description: orFallback(session.description, '-'),
})

const toWeeklyPayload = (
  weekly: Pick<WeeklyScheduleResponse, 'batchId' | 'week' | 'date' | 'classroomId' | 'description'>,
  sessions: SessionPayload[]
) => ({
  batchId: weekly.batchId,
  week: weekly.week,
  date: weekly.date,
  description: orFallback(weekly.description, DEFAULT_DESCRIPTION),
  ...(weekly.classroomId && { classroomId: weekly.classroomId }),
  sessions,
})

const getBatch = async (batchId: number) =>
  (await apiCourses.get<{ openDate: string; courseId: number }>(`${RoutesApi.Batches}/${batchId}`))
    .data

/** Minggu ke-n sejak angkatan dibuka */
const getWeek = async (batchId: number, date: string) => {
  const { openDate } = await getBatch(batchId)
  return Math.max(1, Math.floor(djs(date).diff(djs(openDate), 'day') / 7) + 1)
}

/** Jumlah peserta sesi Ujian Masuk = siswa terdaftar di kursus angkatan tersebut */
const getTotalStudent = async (batchId: number) => {
  const { courseId } = await getBatch(batchId)
  const { data } = await apiCourses.get<Pagination<unknown[]>>(RoutesApi.Students, {
    params: { courseId, limit: 1 },
  })
  return Math.max(1, data.total ?? 0)
}

const findWeeklySchedule = async (batchId: number, date: string, classroomId: number | null) => {
  // Filter tanggal di backend tidak konsisten, jadi disaring di sini
  const { data } = await apiSchedule.get<Pagination<WeeklyScheduleResponse[]>>(WEEKLY_SCHEDULES, {
    params: { batchId, limit: -1 },
  })
  return data.data.find(
    (weekly) =>
      weekly.batchId === batchId &&
      weekly.date === date &&
      (weekly.classroomId ?? null) === classroomId
  )
}

const buildSession = async (
  payload: TestSchedulePayload,
  teacherId: string,
  existing: SessionPayload[] = []
): Promise<SessionPayload> => {
  // Rentang jam pelajaran memotong kuota JP materi di kurikulum (numEndTime − numStartTime);
  // backend mewajibkan numEndTime > numStartTime, jadi sesi tes memakai tepat 1 JP
  const period = Math.max(1, ...existing.map((session) => session.numEndTime))
  return {
    subjectId: payload.subjectId,
    category: payload.type,
    startTime: payload.startTime,
    endTime: payload.endTime,
    numStartTime: period,
    numEndTime: period + 1,
    ...(payload.type === ENTRANCE_EXAM && {
      totalStudent: await getTotalStudent(payload.batchId),
    }),
    teacherId,
    room: '-',
    description: DEFAULT_DESCRIPTION,
  }
}

/** Buat jadwal tes = tambah sesi ke jadwal akademik angkatan pada tanggal itu */
export const createScheduleSession = async (payload: TestSchedulePayload, teacherId: string) => {
  const classroomId = payload.classroomId ?? null
  const existing = await findWeeklySchedule(payload.batchId, payload.date, classroomId)

  if (existing) {
    const sessions = existing.sessions.map(toSessionPayload)
    const session = await buildSession(payload, teacherId, sessions)
    await apiSchedule.patch(
      `${WEEKLY_SCHEDULE}/${existing.id}`,
      toWeeklyPayload(existing, [...sessions, session])
    )
    return
  }

  const week = await getWeek(payload.batchId, payload.date)
  await apiSchedule.post(
    WEEKLY_SCHEDULE,
    toWeeklyPayload(
      { batchId: payload.batchId, week, date: payload.date, classroomId, description: null },
      [await buildSession(payload, teacherId)]
    )
  )
}

/** Jadwal akademik & sesi pemilik suatu jadwal tes */
const getWeeklyOfTestSchedule = async (testScheduleId: number) => {
  const { data: testSchedule } = await apiScheduleTest.get<{ sessionId: number }>(
    `${RoutesApi.ScheduleTestDetail}/${testScheduleId}`
  )
  const { data: session } = await apiSchedule.get<SessionResponse>(
    `${SESSION}/${testSchedule.sessionId}`
  )
  const { data: weekly } = await apiSchedule.get<WeeklyScheduleResponse>(
    `${WEEKLY_SCHEDULE}/${session.scheduleId}`
  )
  return { weekly, sessionId: testSchedule.sessionId }
}

export const updateScheduleSession = async (
  testScheduleId: number,
  payload: TestSchedulePayload,
  teacherId: string
) => {
  const { weekly, sessionId } = await getWeeklyOfTestSchedule(testScheduleId)
  const classroomId = payload.classroomId ?? null
  const current = weekly.sessions.find((session) => session.id === sessionId)
  const others = weekly.sessions.filter((session) => session.id !== sessionId).map(toSessionPayload)
  const moved = weekly.date !== payload.date || (weekly.classroomId ?? null) !== classroomId

  if (moved && others.length) {
    throw new ScheduleRuleError(
      'Tanggal/kelas tidak dapat diubah karena jadwal akademik hari itu berisi sesi lain. ' +
        'Hapus jadwal tes ini lalu buat ulang di tanggal/kelas baru.'
    )
  }

  const session: SessionPayload = {
    ...(await buildSession(payload, current?.teacherId ?? teacherId, others)),
    id: sessionId,
    ...(current && { numStartTime: current.numStartTime, numEndTime: current.numEndTime }),
  }
  const week = moved ? await getWeek(payload.batchId, payload.date) : weekly.week

  await apiSchedule.patch(
    `${WEEKLY_SCHEDULE}/${weekly.id}`,
    toWeeklyPayload(
      { ...weekly, batchId: payload.batchId, week, date: payload.date, classroomId },
      [...others, session]
    )
  )
}

export const deleteScheduleSession = async (testScheduleId: number) => {
  const { weekly, sessionId } = await getWeeklyOfTestSchedule(testScheduleId)
  const others = weekly.sessions.filter((session) => session.id !== sessionId)

  if (!others.length) {
    await apiSchedule.delete(`${WEEKLY_SCHEDULE}/${weekly.id}`)
    return
  }

  await apiSchedule.patch(
    `${WEEKLY_SCHEDULE}/${weekly.id}`,
    toWeeklyPayload(weekly, others.map(toSessionPayload))
  )
  const { data: after } = await apiSchedule.get<WeeklyScheduleResponse>(
    `${WEEKLY_SCHEDULE}/${weekly.id}`
  )
  if (after.sessions.some((session) => session.id === sessionId)) {
    throw new ScheduleRuleError(
      'Backend belum mendukung penghapusan satu sesi dari jadwal akademik yang berisi beberapa sesi.'
    )
  }
}
