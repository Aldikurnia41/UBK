'use server'

import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { TestScheduleResponse } from '@/feat/test-schedule/dto'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiQuestionBank, apiScheduleTest } from '@/lib/axios'
import { BELNEG_SCHEDULE_TYPES, RoutesApi } from '@/config'

export interface DashboardResponse {
  countPretestQuestion: number
  countPosttestQuestion: number
  countQuizQuestion: number
  /** Rata-rata nilai siswa per mata diklat (materi) pada tahun terpilih */
  averageScores: { subjectName: string; average: number }[]
}

const EMPTY_DASHBOARD: DashboardResponse = {
  countPretestQuestion: 0,
  countPosttestQuestion: 0,
  countQuizQuestion: 0,
  averageScores: [],
}

/**
 * - Jumlah soal: `question-bank /question/count-question` (sama seperti Bahasa). Pretest &
 *   Posttest berbagi bank soal `ujian`, jadi jumlahnya sama.
 * - Rata-rata nilai: rata-rata field `average` jadwal yang sudah dinilai, dikelompokkan per
 *   materi pada tahun terpilih (belum ada endpoint analytic khusus Belneg).
 */
export const getDashboard = async (year: number): Promise<ResponseBase<DashboardResponse>> => {
  try {
    const [{ data: counts }, { data: schedules }] = await Promise.all([
      apiQuestionBank.get<{ _id: 'ujian' | 'kuis'; count: number }[]>(RoutesApi.QuizQuestionCount),
      apiScheduleTest.get<Pagination<(TestScheduleResponse & { average: number | null })[]>>(
        RoutesApi.ScheduleTestList,
        {
          params: {
            status: 'all',
            isCalculated: 'true',
            limit: '10000',
            type: BELNEG_SCHEDULE_TYPES,
          },
        }
      ),
    ])

    const count = (type: 'ujian' | 'kuis') => counts.find((item) => item._id === type)?.count ?? 0
    const bySubject = new Map<string, number[]>()
    for (const schedule of schedules.data) {
      const subject = schedule.session?.subject?.name
      if (!subject || schedule.average === null || !schedule.date.startsWith(`${year}`)) continue
      bySubject.set(subject, [...(bySubject.get(subject) ?? []), Number(schedule.average)])
    }

    return createResponseSuccess({
      countPretestQuestion: count('ujian'),
      countPosttestQuestion: count('ujian'),
      countQuizQuestion: count('kuis'),
      averageScores: [...bySubject.entries()].map(([subjectName, values]) => ({
        subjectName,
        average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      })),
    })
  } catch (error) {
    return createResponseError(error, EMPTY_DASHBOARD)
  }
}
