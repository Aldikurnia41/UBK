import { notFound } from 'next/navigation'
import { getPermissionAbility } from '@/lib/helpers'
import {
  TEST_TYPE_BY_SEGMENT,
  getQuestionSetTitle,
  QUESTION_SET_PATH,
} from '@/feat/question-set/constants'

/** Resolves `/bank-soal/[testType]` and guards the page by the "pertanyaan" permission */
export async function resolveQuestionSetPage(segment: string) {
  const testType = TEST_TYPE_BY_SEGMENT[segment]
  const { question } = await getPermissionAbility()

  if (!testType || !question.canManage) {
    return notFound()
  }

  return { testType, title: getQuestionSetTitle(testType), path: QUESTION_SET_PATH[testType] }
}
