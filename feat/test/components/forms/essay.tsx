'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Label, Textarea } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'

export const EssayForm = ({
  question,
  setTempAnswer,
  max,
  questionAnswer,
  questionId,
  isLoading,
}: {
  question: string
  setTempAnswer: Dispatch<SetStateAction<string>>
  max: number
  questionAnswer?: string
  questionId: string
  isLoading: boolean
}) => {
  const [localValue, setLocalValue] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTempAnswer(localValue)
    }, 500)
    return () => clearTimeout(timer)
  }, [localValue, setTempAnswer])

  useEffect(() => {
    setIsError(false)
    setLocalValue(questionAnswer ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      if (val.length <= max) {
        setIsError(false)
        setLocalValue(val)
        return
      }
      setIsError(true)
    },
    [max]
  )

  return (
    <div className='flex flex-col gap-8'>
      <p className='text-xl font-bold whitespace-pre-line'>{question}</p>
      <div>
        <Label className='mb-2 text-base font-bold'>Isi jawaban essay</Label>
        <Textarea
          disabled={isLoading}
          value={localValue}
          onChange={handleChange}
          placeholder='Ketik jawaban disini...'
          className={cn(
            'text-primary-2 min-h-[90px] border border-slate-500 text-base focus-visible:border-slate-500 focus-visible:ring-0',
            isError && 'border-destructive!'
          )}
        />
        <p className={cn('mt-2 text-sm text-slate-500', isError && 'text-destructive')}>
          Maks. karakter {localValue.length} / {max}
        </p>
      </div>
    </div>
  )
}
