'use server'

import type { SearchParams } from 'next/dist/server/request/search-params'
import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type {
  TestScheduleDetail,
  TestSchedulePayload,
  TestScheduleResponse,
  TestScheduleRow,
} from '@/feat/test-schedule/dto'
import type { ExportFile } from '@/feat/shared/file'
import type { TestType } from '@/config'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiScheduleTest } from '@/lib/axios'
import { auth } from '@/lib/auth'
import {
  createScheduleSession,
  deleteScheduleSession,
  ScheduleRuleError,
  updateScheduleSession,
} from '@/feat/test-schedule/weekly-schedule'
import { detailTestScheduleDTO, listTestScheduleDTO } from '@/feat/test-schedule/dto'
import { toExportFile } from '@/feat/shared/file'
import { BELNEG_SCHEDULE_TYPES, MESSAGE, RoutesApi, SCHEDULE_TYPE } from '@/config'

/**
 * Query UI → query schedule-test:
 * - `testType` (pretest|posttest|kuis) → `type` (Ujian Masuk|Ujian|Kuis); default semua tipe Belneg
 * - `batchId` (Diklat) diteruskan apa adanya, `status` default `all`
 */
const toScheduleQuery = ({ testType, ...searchParams }: SearchParams) => ({
  limit: '10',
  status: 'all',
  ...searchParams,
  type: testType ? SCHEDULE_TYPE[testType as TestType] : BELNEG_SCHEDULE_TYPES,
})

export const getTestSchedules = async (
  searchParams: SearchParams = {}
): Promise<ResponseBase<Pagination<TestScheduleRow[]>>> => {
  try {
    const { data } = await apiScheduleTest.get<Pagination<TestScheduleResponse[]>>(
      RoutesApi.ScheduleTestList,
      { params: toScheduleQuery(searchParams) }
    )
    return createResponseSuccess(listTestScheduleDTO(data))
  } catch (error) {
    return createResponseError(error, { data: [] })
  }
}

export const getTestScheduleById = async (
  id: string
): Promise<ResponseBase<TestScheduleDetail | null>> => {
  try {
    const { data } = await apiScheduleTest.get<TestScheduleResponse>(
      `${RoutesApi.ScheduleTestDetail}/${id}`
    )
    return createResponseSuccess(detailTestScheduleDTO(data))
  } catch (error) {
    return createResponseError(error, null)
  }
}

const currentProfileId = async () => (await auth())?.profile.id ?? ''

/** Pesan dari aturan FE ditampilkan apa adanya, selebihnya dari backend */
const scheduleError = (error: unknown, fallback: string) => {
  if (error instanceof ScheduleRuleError) {
    return { data: null, error: { message: error.message } }
  }
  // Aturan jadwal akademik (kuota JP materi, bentrok tanggal, dsb.) dikembalikan backend
  const { error: responseError } = createResponseError(error, null, fallback)
  return {
    data: null,
    error: { message: `${fallback}: ${responseError?.message ?? 'kesalahan tidak diketahui'}` },
  }
}

/** Tambah = sesi baru di jadwal akademik (penulis sesi = pengguna yang login → kolom Author) */
export const createTestSchedule = async (payload: TestSchedulePayload) => {
  try {
    await createScheduleSession(payload, await currentProfileId())
    return createResponseSuccess({ message: MESSAGE.SUCCESS_CREATE })
  } catch (error) {
    return scheduleError(error, MESSAGE.ERROR_CREATE)
  }
}

export const updateTestSchedule = async (id: number, payload: TestSchedulePayload) => {
  try {
    await updateScheduleSession(id, payload, await currentProfileId())
    return createResponseSuccess({ message: MESSAGE.SUCCESS_UPDATE })
  } catch (error) {
    return scheduleError(error, MESSAGE.ERROR_UPDATE)
  }
}

export const deleteTestSchedule = async (id: number) => {
  try {
    await deleteScheduleSession(id)
    return createResponseSuccess({ message: MESSAGE.SUCCESS_DELETE })
  } catch (error) {
    return scheduleError(error, MESSAGE.ERROR_DELETE)
  }
}

/** Ekspor daftar jadwal (sesuai filter aktif) — `GET /schedules/export` */
export const exportTestSchedules = async (
  searchParams: SearchParams = {}
): Promise<ResponseBase<ExportFile | null>> => {
  try {
    const response = await apiScheduleTest.get<ArrayBuffer>(RoutesApi.ScheduleTestExport, {
      params: toScheduleQuery(searchParams),
      responseType: 'arraybuffer',
    })
    return createResponseSuccess(toExportFile(response, 'jadwal-tes.xlsx'))
  } catch (error) {
    return createResponseError(error, null, 'Gagal mengekspor data')
  }
}

/** Ekspor satu jadwal — `GET /schedule/:id/export` */
export const exportTestScheduleById = async (
  id: number
): Promise<ResponseBase<ExportFile | null>> => {
  try {
    const response = await apiScheduleTest.get<ArrayBuffer>(
      `${RoutesApi.ScheduleTestDetail}/${id}/export`,
      { responseType: 'arraybuffer' }
    )
    return createResponseSuccess(toExportFile(response, `jadwal-tes-${id}.xlsx`))
  } catch (error) {
    return createResponseError(error, null, 'Gagal mengekspor data')
  }
}
