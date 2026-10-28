import type { InferType } from 'yup'
import type { Pagination, ResponseBase } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type { schemaQuestionType } from '@/feat/question-bank/question-type/schema'

export interface QuestionType {
  id: number
  name: string
  description?: string
  questionForm: {
    id: number
    text: string
  }
  file: string
}

export interface QuestionTypeDTO {
  id: number
  name: string
  description?: string
  questionForm: {
    number: number
    text: string
  }
  file: string
}

export const getQuestionTypeDTO = (
  dto: Pagination<QuestionTypeDTO[]>
): ResponseBase<QuestionType[]> => {
  const { data, ...pagination } = dto

  return {
    ...pagination,
    data: data.map((item) => ({
      id: item.id,
      name: item.name,
      file: item.file,
      questionForm: {
        id: item.questionForm.number,
        text: item.questionForm.text,
      },
    })),
  }
}

export const getQuestionTypeByIdDTO = (dto: QuestionTypeDTO): QuestionType => {
  return {
    id: dto.id,
    name: dto.name,
    file: dto.file,
    description: dto.description,
    questionForm: {
      id: dto.questionForm.number,
      text: dto.questionForm.text,
    },
  }
}

// Qestion Type Form
export type QuestionTypeValues = InferType<typeof schemaQuestionType>

export interface QuestionTypePayload {
  questionForm: string
  description?: string
  file?: {
    id: string
    file?: File
    url: string
    type: string
    name: string
  }[]
}

// DTO from external API
// Subject
export interface SubjectDTO {
  id: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export const getSubjectOptionsDTO = (dto: Pagination<SubjectDTO[]>): OptionValue[] => {
  return dto.data.map(({ id, name }) => ({
    value: `${id}`,
    label: name,
  }))
}
