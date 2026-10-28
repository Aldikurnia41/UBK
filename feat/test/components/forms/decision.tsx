'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { Slot } from '../../dto'
import { useState, useEffect } from 'react'
import { Button } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { mergeSlotsWithAnswer } from '@/feat/test/helper'

export const DecisionForm = ({
  isLoading,
  questionId,
  words,
  answer,
  setTempDecisionAnswer,
}: {
  answer?: Slot[]
  words: Slot[]
  isLoading: boolean
  questionId: string
  setTempDecisionAnswer: Dispatch<SetStateAction<Slot[]>>
}) => {
  const [localAnswer, setLocalAnswer] = useState<Slot[]>([])
  const structure = ['S', 'P', 'O', 'KW', 'KT']

  useEffect(() => {
    setLocalAnswer(mergeSlotsWithAnswer(words, answer))
    // eslint-disable-next-line
  }, [questionId])

  useEffect(() => {
    setTempDecisionAnswer(localAnswer)
    // eslint-disable-next-line
  }, [localAnswer])

  const handleSelectStructure = (wordId: string, selectedStructure: string) => {
    setLocalAnswer((prev) =>
      prev.map((word) =>
        word?.id === wordId
          ? {
              ...word,
              answer: selectedStructure,
            }
          : word
      )
    )
  }

  return (
    <div
      className={cn(
        'border-muted flex flex-col gap-20 rounded-md border bg-[#CBD5E126] p-6 shadow',
        localAnswer.length > 5 && 'flex-col'
      )}
    >
      {localAnswer.map((val) => (
        <div key={val?.id} className='flex flex-col gap-6'>
          <p className='text-5xl font-bold'>{val?.value}</p>
          <div className='flex gap-4'>
            {structure.map((key) => (
              <Button
                key={key}
                variant='outline'
                onClick={() => handleSelectStructure(val?.id ?? '', key)}
                disabled={isLoading}
                className={
                  cn(
                    'active:bg-primary hover:bg-primary/70 h-12 w-14 rounded-md border-2 border-[#C8CDD0] transition hover:text-white',
                    key === val?.answer && 'bg-primary border-none text-white'
                  ) ?? void 0
                }
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
