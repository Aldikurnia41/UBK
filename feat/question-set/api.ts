'use server'

import type { SearchParams } from 'next/dist/server/request/search-params'
import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type {
  FormResponse,
  QuestionDetail,
  QuestionPayload,
  QuestionResponse,
  QuestionRow,
} from '@/feat/question-set/dto'
import type { FormType, TestType } from '@/config'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiCourses, apiQuestionBank, apiScheduleTest } from '@/lib/axios'
import { detailQuestionDTO, FORM_NUMBER, listQuestionDTO } from '@/feat/question-set/dto'
import { MESSAGE, QUESTION_TEST_TYPE, RoutesApi } from '@/config'

/**
 * Pretest & Posttest sama-sama memakai `testType=ujian` di question-bank (backend belum
 * membedakannya), Kuis memakai `kuis`. Filter `formType` → `formId` (nomor bentuk soal).
 */
export const getQuestions = async (
  testType: TestType,
  { formType, ...searchParams }: SearchParams = {}
): Promise<ResponseBase<Pagination<QuestionRow[]>>> => {
  try {
    const { data } = await apiQuestionBank.get<Pagination<QuestionResponse[]>>(
      RoutesApi.QuizQuestion,
      {
        params: {
          perPage: '10',
          ...searchParams,
          'testType[]': QUESTION_TEST_TYPE[testType],
          ...(formType && { formId: FORM_NUMBER[formType as FormType] }),
        },
      }
    )
    return createResponseSuccess(listQuestionDTO(data, testType))
  } catch (error) {
    return createResponseError(error, { data: [] })
  }
}

export const getQuestionById = async (
  id: string,
  testType: TestType
): Promise<ResponseBase<QuestionDetail | null>> => {
  try {
    const { data } = await apiQuestionBank.get<QuestionResponse>(`${RoutesApi.QuizQuestion}/${id}`)
    if (data.testType !== QUESTION_TEST_TYPE[testType]) {
      return createResponseSuccess(null)
    }
    return createResponseSuccess(detailQuestionDTO(data, testType))
  } catch (error) {
    return createResponseError(error, null)
  }
}

/** `id` bentuk soal di `/forms` untuk setiap nomor bentuk soal */
export const getFormIds = async (): Promise<ResponseBase<Record<number, number>>> => {
  try {
    const { data } = await apiScheduleTest.get<Pagination<FormResponse[]>>(
      RoutesApi.QuestionTypes,
      { params: { limit: '-1' } }
    )
    return createResponseSuccess(
      Object.fromEntries(data.data.map((form) => [form.questionForm.number, form.id]))
    )
  } catch (error) {
    return createResponseError(error, {})
  }
}

/** Kursus (Diklat) untuk bank soal — soal disimpan per kursus, grade kursus jadi `difficulty` */
export const getQuestionCourseOptions = async (): Promise<
  ResponseBase<(OptionValue & { grade: string })[]>
> => {
  try {
    const { data } = await apiCourses.get<
      Pagination<{ id: number; batchName: string; grade?: string }[]>
    >(RoutesApi.Courses, { params: { limit: '-1' } })
    return createResponseSuccess(
      data.data.map((course) => ({
        value: `${course.id}`,
        label: course.batchName,
        grade: course.grade ?? '',
      }))
    )
  } catch (error) {
    return createResponseError(error, [])
  }
}

/**
 * Form tambah dapat berisi banyak pertanyaan; question-bank menerima satu pertanyaan per
 * request, jadi dikirim berurutan. Bila gagal di tengah, pertanyaan sebelumnya sudah tersimpan.
 */
export const createQuestions = async (payloads: QuestionPayload[]) => {
  let saved = 0
  try {
    for (const payload of payloads) {
      await apiQuestionBank.post(RoutesApi.QuizQuestion, payload)
      saved += 1
    }
    return createResponseSuccess({ message: MESSAGE.SUCCESS_CREATE, saved })
  } catch (error) {
    const { error: responseError } = createResponseError(error, null, MESSAGE.ERROR_CREATE)
    return {
      data: null,
      error: {
        message: saved
          ? `${saved} pertanyaan tersimpan, pertanyaan ke-${saved + 1} gagal: ${responseError?.message}`
          : (responseError?.message ?? MESSAGE.ERROR_CREATE),
      },
    }
  }
}

export const updateQuestion = async (id: string, payload: QuestionPayload) => {
  try {
    await apiQuestionBank.put(`${RoutesApi.QuizQuestion}/${id}`, payload)
    return createResponseSuccess({ message: MESSAGE.SUCCESS_UPDATE })
  } catch (error) {
    return createResponseError(error, null, MESSAGE.ERROR_UPDATE)
  }
}

export const deleteQuestion = async (id: string) => {
  try {
    await apiQuestionBank.delete(`${RoutesApi.QuizQuestion}/${id}`)
    return createResponseSuccess({ message: MESSAGE.SUCCESS_DELETE })
  } catch (error) {
    return createResponseError(error, null, MESSAGE.ERROR_DELETE)
  }
}
