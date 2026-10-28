'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { FormattedQuestion, Slot } from '@/feat/test/dto'
import {
  ESSAY_A,
  LISTENING_A,
  LISTENING_B,
  STRUCTURE_A,
  STRUCTURE_B,
  STRUCTURE_C,
  STRUCTURE_D,
} from '@/feat/test/constant'
import {
  DecisionForm,
  EssayForm,
  MultipleChoiceForm,
  WordArrangeForm,
} from '@/feat/test/components/forms'

interface FormByTypeProps extends FormattedQuestion {
  formId: number
  setTempAnswer: Dispatch<SetStateAction<string>>
  setTempObjectAnswer: Dispatch<SetStateAction<Slot[]>>
  max_textarea: number
  isLoading: boolean
}

export default function FormByType({
  formId,
  question,
  answers,
  image,
  audio,
  setTempAnswer,
  setTempObjectAnswer,
  max_textarea,
  answer,
  id: questionId,
  isLoading,
}: FormByTypeProps) {
  switch (formId) {
    case STRUCTURE_A:
    case STRUCTURE_B:
    case LISTENING_A:
    case LISTENING_B:
      return (
        <MultipleChoiceForm
          isLoading={isLoading}
          answer={typeof answer === 'string' ? answer : ''}
          setTempAnswer={setTempAnswer}
          question={String(question)}
          answers={answers}
          image={image}
          audio={audio}
          questionId={questionId}
          formId={formId}
        />
      )
    case STRUCTURE_C:
      return (
        <DecisionForm
          isLoading={isLoading}
          words={answers}
          answer={Array.isArray(answer) ? answer : []}
          questionId={questionId}
          setTempDecisionAnswer={setTempObjectAnswer}
        />
      )
    case STRUCTURE_D:
      return (
        <WordArrangeForm
          isLoading={isLoading}
          words={answers}
          answer={typeof answer === 'string' ? answer : ''}
          questionId={questionId}
          question={question}
          setTempArrangeAnswer={setTempObjectAnswer}
        />
      )
    case ESSAY_A:
      return (
        <EssayForm
          isLoading={isLoading}
          setTempAnswer={setTempAnswer}
          question={String(question)}
          max={max_textarea}
          questionAnswer={typeof answer === 'string' ? answer : ''}
          questionId={questionId}
        />
      )
    default:
      return 'Bentuk Soal Tidak Sesuai'
  }
}
