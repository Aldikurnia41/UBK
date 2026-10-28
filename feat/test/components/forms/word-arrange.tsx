'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { FormattedQuestion, Slot } from '../../dto'
import { useState, useEffect } from 'react'
import { Button } from '@sisfo-remake/ui'
import { matchWordsToSlots } from '@/feat/test/helper'

export const WordArrangeForm = ({
  words,
  answer,
  questionId,
  setTempArrangeAnswer,
  question,
  isLoading,
}: {
  words: { value: string; id: string }[]
  answer?: string
  setTempArrangeAnswer: Dispatch<SetStateAction<Slot[]>>
  questionId: string
  question: string
  isLoading: boolean
}) => {
  const [localAnswer, setLocalAnswer] = useState<Slot[]>([])

  useEffect(() => {
    const obj: FormattedQuestion = {
      id: questionId,
      answers: words,
      answer,
      audio: '',
      image: '',
      question,
    }

    setLocalAnswer(matchWordsToSlots(obj))
    // eslint-disable-next-line
  }, [questionId])

  useEffect(() => {
    setTempArrangeAnswer(localAnswer)
    // eslint-disable-next-line
  }, [localAnswer])

  const handleSourceClick = (word: { value: string; id: string }) => {
    setLocalAnswer((prev) => {
      const firstEmpty = prev.findIndex((slot) => slot === null)
      const updated = [...prev]
      if (firstEmpty !== -1) {
        updated[firstEmpty] = word
      } else {
        updated.push(word)
      }
      return updated
    })
  }

  const handleTargetClick = (idx: number) => {
    setLocalAnswer((prev) => {
      const updated = [...prev]
      updated[idx] = null
      return updated
    })
  }

  return (
    <div>
      <div className='mb-9 flex min-h-[177px] flex-wrap items-center justify-center gap-x-6 gap-y-8 rounded-md border border-gray-200 bg-slate-300/15 p-6'>
        {Array.from({ length: words.length }).map((_, idx) => (
          <Button
            disabled={isLoading}
            className={
              localAnswer[idx]?.value
                ? 'w-fit border-2 border-[#C8CDD0] px-4'
                : 'w-[100px] border-none bg-[#C8CDD0]/20'
            }
            variant={localAnswer[idx]?.value ? 'outline' : 'secondary'}
            key={idx}
            onClick={() => handleTargetClick(idx)}
          >
            {localAnswer[idx]?.value ?? ''}
          </Button>
        ))}
      </div>
      <div className='flex flex-wrap justify-center gap-4'>
        {words.map((word) => (
          <Button
            disabled={localAnswer.some((answer) => answer?.id === word.id) || isLoading}
            key={word.id}
            variant='outline'
            className='border-2 border-[#C8CDD0] px-4 text-wrap'
            onClick={() => handleSourceClick(word)}
          >
            {word.value}
          </Button>
        ))}
      </div>
    </div>
  )
}
