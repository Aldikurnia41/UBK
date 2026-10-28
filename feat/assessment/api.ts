'use server'

import type { SearchParams } from 'next/dist/server/request/search-params'
import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { TestScheduleDetail, TestScheduleResponse } from '@/feat/test-schedule/dto'
import type { ExportFile } from '@/feat/shared/file'
import type {
  AnswerScoreItemResponse,
  AnswerScorePayload,
  ResultRow,
  WorktestDetail,
  WorktestResponse,
  WorktestRow,
} from '@/feat/assessment/dto'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiAssessmentCBT, apiScheduleTest } from '@/lib/axios'
import { detailTestScheduleDTO } from '@/feat/test-schedule/dto'
import { getTestSchedules } from '@/feat/test-schedule/api'
import { toExportFile } from '@/feat/shared/file'
import { detailWorktestDTO, listResultDTO, listWorktestDTO } from '@/feat/assessment/dto'
import { RoutesApi } from '@/config'

/** Filter jadwal untuk menu Penilaian: tes sudah selesai & nilai belum dikirim */
const ASSESSMENT_FILTER = { status: 'past', isCalculated: 'false' }
/** Filter jadwal untuk menu Hasil: nilai sudah dikirim */
const RESULT_FILTER = { status: 'all', isCalculated: 'true' }

export const getAssessmentSchedules = async (searchParams: SearchParams = {}) =>
  getTestSchedules({ ...searchParams, ...ASSESSMENT_FILTER })

export const getResultSchedules = async (searchParams: SearchParams = {}) =>
  getTestSchedules({ ...searchParams, ...RESULT_FILTER })

/** assessment-ubk memakai `search` untuk pencarian, sedangkan TableView menulis `q` di URL */
const fetchWorktests = (scheduleId: string, { q, ...searchParams }: SearchParams) =>
  apiAssessmentCBT.get<Pagination<WorktestResponse[]>>(
    `${RoutesApi.WorktestSchedule}/${scheduleId}`,
    { params: { limit: '10', ...searchParams, search: q } }
  )

/** `GET /work-test/schedule/:scheduleId` */
export const getWorktestsBySchedule = async (
  scheduleId: string,
  searchParams: SearchParams = {}
): Promise<ResponseBase<Pagination<WorktestRow[]>>> => {
  try {
    const { data } = await fetchWorktests(scheduleId, searchParams)
    return createResponseSuccess(listWorktestDTO(data))
  } catch (error) {
    return createResponseError(error, { data: [] })
  }
}

export const getResultsBySchedule = async (
  scheduleId: string,
  searchParams: SearchParams = {}
): Promise<ResponseBase<Pagination<ResultRow[]>>> => {
  try {
    const { data } = await fetchWorktests(scheduleId, searchParams)
    return createResponseSuccess(listResultDTO(data))
  } catch (error) {
    return createResponseError(error, { data: [] })
  }
}

/**
 * Header pengerjaan (`GET /work-test/:id`) + soal, jawaban & skor
 * (`GET /answer-scores/work-test/:workTestId`), lalu jadwalnya (`GET /schedule/:id`).
 */
export const getWorktestById = async (
  worktestId: string
): Promise<ResponseBase<{ worktest: WorktestDetail; schedule: TestScheduleDetail } | null>> => {
  try {
    const [{ data: worktest }, { data: answers }] = await Promise.all([
      apiAssessmentCBT.get<WorktestResponse>(`${RoutesApi.Worktest}/${worktestId}`),
      apiAssessmentCBT.get<Pagination<AnswerScoreItemResponse[]>>(
        `${RoutesApi.AnswerScoreWorkTest}/${worktestId}`,
        { params: { limit: '-1' } }
      ),
    ])
    const { data: schedule } = await apiScheduleTest.get<TestScheduleResponse>(
      `${RoutesApi.ScheduleTestDetail}/${worktest.scheduleId}`
    )
    return createResponseSuccess({
      worktest: detailWorktestDTO(worktest, answers.data),
      schedule: detailTestScheduleDTO(schedule),
    })
  } catch (error) {
    return createResponseError(error, null)
  }
}

/**
 * Simpan nilai essay (`POST /answer-scores/bulk`, sama seperti Bahasa), lalu hitung ulang nilai
 * akhir pengerjaan (`POST /work-test/:id/calculate`). Nilai pilihan ganda dihitung otomatis oleh
 * BE dan tidak dikirim.
 */
export const saveWorktestScores = async (worktestId: number, scores: AnswerScorePayload[]) => {
  try {
    await apiAssessmentCBT.post(RoutesApi.AnswerScoreBulk, scores)
    await apiAssessmentCBT.post(`${RoutesApi.Worktest}/${worktestId}/calculate`)
    return createResponseSuccess({ message: 'Berhasil menyimpan nilai' })
  } catch (error) {
    return createResponseError(error, null, 'Gagal menyimpan nilai')
  }
}

/** "Kirim Nilai" — mengunci nilai jadwal (`PATCH /schedule/:id/locked`) dan memindahkannya ke Hasil */
export const submitScheduleScores = async (scheduleId: number) => {
  try {
    await apiScheduleTest.patch(`${RoutesApi.ScheduleTestDetail}/${scheduleId}/locked`)
    return createResponseSuccess({ message: 'Berhasil mengirim nilai' })
  } catch (error) {
    return createResponseError(error, null, 'Gagal mengirim nilai')
  }
}

/** `GET /work-test/schedule/:scheduleId/export` */
export const exportWorktests = async (
  scheduleId: number,
  searchParams: SearchParams = {}
): Promise<ResponseBase<ExportFile | null>> => {
  try {
    const response = await apiAssessmentCBT.get<ArrayBuffer>(
      `${RoutesApi.WorktestSchedule}/${scheduleId}/export`,
      { params: searchParams, responseType: 'arraybuffer' }
    )
    return createResponseSuccess(toExportFile(response, `nilai-jadwal-${scheduleId}.xlsx`))
  } catch (error) {
    return createResponseError(error, null, 'Gagal mengekspor data')
  }
}
