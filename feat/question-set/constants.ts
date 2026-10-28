import { Routes, TEST_TYPE_LABEL, TestType } from '@/config'

/** Segmen URL `/bank-soal/[testType]` → jenis tes */
export const TEST_TYPE_BY_SEGMENT: Record<string, TestType> = {
  [Routes.PretestQuestion.slice(1)]: TestType.Pretest,
  [Routes.PosttestQuestion.slice(1)]: TestType.Posttest,
  [Routes.QuizQuestion.slice(1)]: TestType.Kuis,
}

export const QUESTION_SET_PATH: Record<TestType, string> = {
  [TestType.Pretest]: `${Routes.QuestionBank}${Routes.PretestQuestion}`,
  [TestType.Posttest]: `${Routes.QuestionBank}${Routes.PosttestQuestion}`,
  [TestType.Kuis]: `${Routes.QuestionBank}${Routes.QuizQuestion}`,
}

export const getQuestionSetTitle = (testType: TestType) => `Soal ${TEST_TYPE_LABEL[testType]}`

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 5
