import type { ValidationError } from 'yup'
import type { QuestionDetail, QuestionPayload } from '@/feat/question-set/dto'
import type { TestType } from '@/config'
import { yup } from '@/lib/utils'
import { FORM_NUMBER } from '@/feat/question-set/dto'
import { MIN_OPTIONS } from '@/feat/question-set/constants'
import { FormType, QUESTION_TEST_TYPE, YupMessage } from '@/config'

export interface QuestionOptionValues {
  id?: string
  text: string
}

export interface QuestionValues {
  question: string
  options: QuestionOptionValues[]
  /** Index opsi jawaban yang benar (pilihan ganda) */
  correctIndex: number
}

export interface QuestionSetValues {
  testType: TestType
  courseId: string
  subjectId: string
  formType: FormType | ''
  questions: QuestionValues[]
}

export const createEmptyQuestion = (formType: FormType | ''): QuestionValues => ({
  question: '',
  options:
    formType === FormType.PilihanGanda
      ? Array.from({ length: MIN_OPTIONS }, () => ({ text: '' }))
      : [],
  correctIndex: -1,
})

const buildSchema = (formType: FormType | '') => {
  const isMultipleChoice = formType === FormType.PilihanGanda

  return yup.object({
    courseId: yup.string().required('Pilih diklat'),
    subjectId: yup.string().required('Pilih materi'),
    formType: yup.string().required('Pilih bentuk soal'),
    questions: yup
      .array()
      .min(1, 'Minimal 1 pertanyaan')
      .of(
        yup.object({
          question: yup
            .string()
            .trim()
            .required(YupMessage.Required)
            .max(3000, 'Maksimal 3000 karakter'),
          options: isMultipleChoice
            ? yup
                .array()
                .min(MIN_OPTIONS, `Minimal ${MIN_OPTIONS} opsi jawaban`)
                .of(
                  yup.object({
                    text: yup.string().trim().required('Opsi jawaban wajib diisi').max(500),
                  })
                )
                .test('unique', 'Opsi jawaban tidak boleh sama', (options) => {
                  const texts = (options ?? []).map((option) => option.text.trim().toLowerCase())
                  return new Set(texts).size === texts.length
                })
            : yup.array(),
          correctIndex: isMultipleChoice
            ? yup.number().min(0, 'Pilih salah satu jawaban yang benar')
            : yup.number(),
        })
      ),
  })
}

/**
 * Form-level validator for TanStack Form. The rules depend on the selected "Bentuk Soal",
 * so the schema is rebuilt from the current values and yup paths
 * (`questions[0].options[1].text`) are mapped 1:1 to TanStack field names.
 */
export const validateQuestionSet = ({ value }: { value: QuestionSetValues }) => {
  try {
    buildSchema(value.formType).validateSync(value, { abortEarly: false })
    return undefined
  } catch (error) {
    const fields: Record<string, string> = {}
    for (const inner of (error as ValidationError).inner) {
      if (inner.path && !fields[inner.path]) fields[inner.path] = inner.message
    }
    return { fields }
  }
}

export const toQuestionSetValues = (
  testType: TestType,
  detail?: QuestionDetail | null
): QuestionSetValues => {
  if (!detail) {
    return { testType, courseId: '', subjectId: '', formType: '', questions: [] }
  }

  return {
    testType,
    courseId: detail.courseId,
    subjectId: detail.subjectId,
    formType: detail.formType,
    questions: [
      {
        question: detail.question,
        options: detail.options.map(({ id, text }) => ({ id, text })),
        correctIndex: detail.options.findIndex((option) => option.isCorrect),
      },
    ],
  }
}

/** Satu payload `POST /question` per pertanyaan */
export const toQuestionPayloads = (
  value: QuestionSetValues,
  {
    formIds,
    grade,
    active = true,
  }: { formIds: Record<number, number>; grade: string; active?: boolean }
): QuestionPayload[] => {
  const formType = value.formType as FormType
  const isMultipleChoice = formType === FormType.PilihanGanda
  const formNumber = FORM_NUMBER[formType]

  return value.questions.map((question) => ({
    testType: QUESTION_TEST_TYPE[value.testType],
    formId: formIds[formNumber] ?? formNumber,
    courseId: Number(value.courseId),
    subjectId: value.subjectId,
    difficulty: grade,
    active,
    question: question.question.trim(),
    ...(isMultipleChoice && {
      answerIndex: question.correctIndex,
      answers: question.options.map((option) => ({
        id: option.id ?? '',
        value: option.text.trim(),
      })),
    }),
  }))
}
