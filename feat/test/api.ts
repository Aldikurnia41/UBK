'use server'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type {
  WorktestResponse,
  Batch,
  Classroom,
  ExamTestScheduleDetailResponse,
  ExamTestScheduleResponse,
  QuizTestScheduleDetailResponse,
  QuizTestScheduleResponse,
  FormTestResponse,
  WorktestResultResponse,
  StudentProfileResponse,
  StudentTestSchedule,
  StudentTestScheduleResponse,
} from '@/feat/test/dto'
import type { TestType } from '@/config'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiCourses, apiIntegration, apiSchedule, apiScheduleTest } from '@/lib/axios'
import { studentTestScheduleDTO } from '@/feat/test/dto'
import { BELNEG_SCHEDULE_TYPES, RoutesApi, SCHEDULE_TYPE } from '@/config'

export const getQuizTestSchedule = async (searchParams?: Pagination) => {
  try {
    const { data: schedule } = await apiSchedule.get<Pagination<QuizTestScheduleResponse[]>>(
      RoutesApi.ScheduleTestList,
      {
        params: {
          ...searchParams,
          type: 'Kuis',
          limit: 10,
          status: ['future', 'present'],
        },
      }
    )
    return createResponseSuccess(schedule)
  } catch (error) {
    return createResponseError<Pagination<QuizTestScheduleResponse[]>>(error, { data: [] })
  }
}

export const getQuizTestScheduleById = async (scheduleId: number) => {
  try {
    const response = await apiSchedule.get<QuizTestScheduleDetailResponse>(
      `${RoutesApi.ScheduleTestDetail}/${scheduleId}`
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const getExamTestSchedule = async (searchParams?: Pagination) => {
  try {
    const { data: schedule } = await apiSchedule.get<Pagination<ExamTestScheduleResponse[]>>(
      RoutesApi.ScheduleTestList,
      {
        params: {
          ...searchParams,
          type: ['Ujian', 'Ujian Masuk', 'Seleksi Kelas'],
          limit: 10,
          status: ['future', 'present'],
        },
      }
    )
    return createResponseSuccess(schedule)
  } catch (error) {
    return createResponseError<Pagination<ExamTestScheduleResponse[]>>(error, { data: [] })
  }
}

export const getExamTestScheduleById = async (scheduleId: number) => {
  try {
    const response = await apiSchedule.get<ExamTestScheduleDetailResponse>(
      `${RoutesApi.ScheduleTestDetail}/${scheduleId}`
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

/** ================================= BATCH COURSE ===================================== */
export const getBatchCourses = async (searchParams = { limit: '-1', sortType: 'desc' }) => {
  try {
    const { data } = await apiCourses.get<Pagination<Batch[]>>(RoutesApi.Batches, {
      params: searchParams,
    })

    const batches = data.data.map(({ id, course, name }) => ({
      value: `${id}`,
      label: `${course.batchName} - ${name}`,
    })) satisfies OptionValue[]

    return createResponseSuccess(batches)
  } catch (error) {
    return createResponseError(error, [])
  }
}

/** ================================= CLASSROOM ===================================== */
export const getClassrooms = async (searchParams = { limit: '-1', sortType: 'desc' }) => {
  try {
    const { data } = await apiCourses.get<Pagination<Classroom[]>>(RoutesApi.ClassRooms, {
      params: searchParams,
    })

    const classrooms = data.data.map(({ id, name }) => ({
      value: `${id}`,
      label: name,
    })) satisfies OptionValue[]

    return createResponseSuccess(classrooms)
  } catch (error) {
    return createResponseError(error, [])
  }
}

export const startOrContinueTestByScheduleId = async (payload: {
  scheduleId: number
  token: string
}) => {
  try {
    const response = await apiIntegration.post<WorktestResponse>(
      RoutesApi.Worktest + '/start',
      payload
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const startOrContinueTest = async (worktest: number) => {
  try {
    const response = await apiIntegration.post<WorktestResponse>(
      RoutesApi.Worktest + `/${worktest}/start`
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const nextSection = async (worktest: number) => {
  try {
    const response = await apiIntegration.post(RoutesApi.Worktest + `/${worktest}/next-section`)
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const postWorkTesttoResult = async (schedule: number) => {
  try {
    const response = await apiIntegration.post(RoutesApi.Worktest + `/${schedule}/push`)
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const getFormTest = async () => {
  try {
    const response = await apiScheduleTest.get<Pagination<FormTestResponse[]>>(
      RoutesApi.QuestionTypes,
      {
        params: {
          'testType[]': 'ujian',
        },
      }
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, { data: [] })
  }
}

export const getFinishWorktestById = async (id: number) => {
  try {
    const response = await apiIntegration.get<WorktestResultResponse>(
      `${RoutesApi.Worktest}/${id}/finish`
    )
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const getProfileByMe = async () => {
  try {
    const response = await apiIntegration.get<StudentProfileResponse>(RoutesApi.AuthProfile)
    return createResponseSuccess(response.data)
  } catch (error) {
    return createResponseError(error, null)
  }
}

/**
 * Jadwal Tes siswa (Belneg): Pretest, Posttest & Kuis dalam satu daftar. Backend memfilter jadwal
 * milik siswa dan mengisi `playable`.
 */
export const getStudentTestSchedules = async (
  { testType, ...searchParams }: Record<string, string | string[] | undefined> = {},
  status: string[] = ['future', 'present']
) => {
  try {
    const { data } = await apiSchedule.get<Pagination<StudentTestScheduleResponse[]>>(
      RoutesApi.ScheduleTestList,
      {
        params: {
          limit: 10,
          ...searchParams,
          type: testType ? SCHEDULE_TYPE[testType as TestType] : BELNEG_SCHEDULE_TYPES,
          status,
        },
      }
    )
    return createResponseSuccess(studentTestScheduleDTO(data))
  } catch (error) {
    return createResponseError<Pagination<StudentTestSchedule[]>>(error, { data: [] })
  }
}
