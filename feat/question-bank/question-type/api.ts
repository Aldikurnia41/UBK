'use server'

import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type {
  QuestionType,
  QuestionTypeDTO,
  QuestionTypePayload,
  SubjectDTO,
} from '@/feat/question-bank/question-type/dto'
import { createResponseError, createResponseSuccess, qstring } from '@sisfo-remake/ui/utils'
import { apiCourses, apiScheduleTest } from '@/lib/axios'
import {
  getQuestionTypeByIdDTO,
  getQuestionTypeDTO,
  getSubjectOptionsDTO,
} from '@/feat/question-bank/question-type/dto'
import { RoutesApi } from '@/config'

export const getQuizTypeOrThrow = async (
  pagination: Pagination
): Promise<ResponseBase<Pagination<QuestionType[]>>> => {
  try {
    const { data } = await apiScheduleTest.get<Pagination<QuestionTypeDTO[]>>(
      qstring(`${RoutesApi.QuestionTypes}`, {
        sort: 'name',
        sortType: 'DESC',
        ...pagination,
      })
    )

    return createResponseSuccess(getQuestionTypeDTO(data))
  } catch (error) {
    return createResponseError(error)
  }
}

export const getQuizTypeById = async (id: string): Promise<ResponseBase<QuestionType>> => {
  try {
    const { data } = await apiScheduleTest.get<QuestionTypeDTO>(`${RoutesApi.QuestionType}/${id}`)
    return createResponseSuccess(getQuestionTypeByIdDTO(data))
  } catch (error) {
    return createResponseError(error)
  }
}

export const createQuizType = async ({ payload }: { payload: QuestionTypePayload }) => {
  const formData = new FormData()

  formData.append('questionForm[]', String(payload.questionForm))
  payload.file?.forEach((item) => {
    if (item.file) {
      formData.append('file', item.file)
    }
  })

  try {
    const { data } = await apiScheduleTest.post<unknown>(`${RoutesApi.QuestionType}`, formData)
    return createResponseSuccess(data)
  } catch (error) {
    return createResponseError(error)
  }
}

export const updateQuizType = async ({
  id,
  payload,
}: {
  id: string | number
  payload: QuestionTypePayload
}) => {
  const formData = new FormData()

  formData.append('questionForm', String(payload.questionForm))
  formData.append('description', String(payload.description))

  payload.file?.forEach((item) => {
    if (item.file) {
      formData.append('file', item.file)
    }
  })

  try {
    const { data } = await apiScheduleTest.patch<unknown>(
      `${RoutesApi.QuestionType}/${id}`,
      formData
    )
    return createResponseSuccess(data)
  } catch (error) {
    return createResponseError(error)
  }
}

export const deleteQuizType = async (id: string | number) => {
  try {
    const { data } = await apiScheduleTest.delete<unknown>(`${RoutesApi.QuestionType}/${id}`)
    return createResponseSuccess(data)
  } catch (error) {
    return createResponseError(error)
  }
}

export const exportQuizType = async (): Promise<ResponseBase<Blob>> => {
  try {
    const { data } = await apiCourses.get<ArrayBuffer>(
      qstring(`${RoutesApi.QuestionTypes}/export`, {
        sort: 'createdAt',
        sortType: 'DESC',
      }),
      {
        responseType: 'arraybuffer',
      }
    )

    const blob = new Blob([data])
    return createResponseSuccess(blob)
  } catch (error) {
    return createResponseError(error)
  }
}
// External API ( Subject )
export const getSubjectOptions = async (): Promise<ResponseBase<OptionValue[]>> => {
  try {
    const { data } = await apiCourses.get<Pagination<SubjectDTO[]>>(
      qstring(`${RoutesApi.Subject}`, { limit: -1 })
    )

    return createResponseSuccess(getSubjectOptionsDTO(data))
  } catch (error) {
    return createResponseError(error)
  }
}
