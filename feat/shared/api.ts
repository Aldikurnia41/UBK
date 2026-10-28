'use server'

import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type { BatchResponse } from '@/feat/test-schedule/dto'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiCourses } from '@/lib/axios'
import { batchLabel } from '@/feat/test-schedule/dto'
import { RoutesApi } from '@/config'

interface NamedItem {
  id: number
  name: string
}

export interface CourseOption extends OptionValue {
  /** Kursus (course) dari angkatan ini, dipakai untuk memuat Materi */
  courseId: string
}

/** Diklat — angkatan kursus (`/batches`), ditampilkan "Kursus - Angkatan" */
export const getCourseOptions = async (): Promise<ResponseBase<CourseOption[]>> => {
  try {
    const { data } = await apiCourses.get<Pagination<BatchResponse[]>>(RoutesApi.Batches, {
      params: { limit: '-1', sortType: 'desc' },
    })
    return createResponseSuccess(
      data.data.map((batch) => ({
        value: `${batch.id}`,
        label: batchLabel(batch),
        courseId: `${batch.courseId}`,
      }))
    )
  } catch (error) {
    return createResponseError(error, [])
  }
}

/** Materi — subjek milik suatu kursus */
export const getSubjectOptions = async (
  courseId?: string
): Promise<ResponseBase<OptionValue[]>> => {
  try {
    const { data } = await apiCourses.get<Pagination<NamedItem[]>>(RoutesApi.Subject, {
      params: { limit: '-1', courseId },
    })
    return createResponseSuccess(data.data.map(({ id, name }) => ({ value: `${id}`, label: name })))
  } catch (error) {
    return createResponseError(error, [])
  }
}

/** Kelas milik suatu angkatan (wajib untuk Kuis & Posttest) */
export const getClassroomOptions = async (
  batchId?: string
): Promise<ResponseBase<OptionValue[]>> => {
  if (!batchId) return createResponseSuccess([])
  try {
    const { data } = await apiCourses.get<Pagination<NamedItem[]>>(RoutesApi.ClassRooms, {
      params: { limit: '-1', batchId },
    })
    return createResponseSuccess(data.data.map(({ id, name }) => ({ value: `${id}`, label: name })))
  } catch (error) {
    return createResponseError(error, [])
  }
}
