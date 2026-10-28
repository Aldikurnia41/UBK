import type { Dispatch, SetStateAction } from 'react'
import type { FormattedQuestion, Slot } from './dto'
import { djs } from '@/lib/utils'
import { ESSAY_A, STRUCTURE_C, STRUCTURE_D } from '@/feat/test/constant'

export const formatDJS = (date: string, start: string, end: string, format: string) => {
  const splittedFormat = format.split(' - ')
  return (
    djs(`${date} ${start}`).format(splittedFormat[0]) +
    ' - ' +
    djs(`${date} ${end}`).format(splittedFormat[1])
  )
}

export function matchWordsToSlots(question: FormattedQuestion): Slot[] {
  const words =
    typeof question.answer === 'string' && question.answer ? question.answer.split(' ') : []
  const usedIndices = new Set<number>()
  const slots: Slot[] = Array.from({ length: question.answers.length }, () => null)

  words.forEach((value, i) => {
    const idx = question.answers.findIndex((a, j) => a.value === value && !usedIndices.has(j))
    if (idx !== -1) {
      usedIndices.add(idx)
      slots[i] = question.answers[idx]
    }
  })

  return slots
}

// lib/answer-serializer.ts
export function initializeAnswer(
  question: FormattedQuestion,
  formId: number,
  setTempAnswer: Dispatch<SetStateAction<string>>,
  setTempObjectAnswer: Dispatch<SetStateAction<Slot[]>>
) {
  if (STRUCTURE_C === formId) {
    setTempObjectAnswer((question?.answer as never) || question.answers)
  } else if (STRUCTURE_D === formId) {
    setTempObjectAnswer(matchWordsToSlots(question))
  } else {
    setTempAnswer(typeof question.answer == 'string' ? question.answer : '')
  }
}

export function serializeAnswer(
  formId: number,
  tempAnswer: string,
  tempObjectAnswer: Slot[],
  maxChars: number
): string | { id?: string; answer?: string }[] | null {
  if (STRUCTURE_C === formId) {
    return tempObjectAnswer.map((a) => ({ id: a?.id, answer: a?.answer }))
  }
  if (STRUCTURE_D === formId) {
    return tempObjectAnswer.some((v) => v?.value)
      ? tempObjectAnswer.map((a) => a?.value).join(' ')
      : ''
  }
  if (ESSAY_A === formId && tempAnswer.length > maxChars) {
    return null // signal "don't submit"
  }
  return tempAnswer
}

export function mergeSlotsWithAnswer(words: Slot[], answer: Slot[] | undefined): Slot[] {
  if (!answer || answer.length === 0) return words

  const answerMap = new Map(
    answer.filter((a): a is NonNullable<Slot> => a !== null).map((a) => [a.id, a])
  )

  return words.map((word) =>
    word ? { ...word, answer: answerMap.get(word.id)?.answer ?? word.answer } : word
  )
}
