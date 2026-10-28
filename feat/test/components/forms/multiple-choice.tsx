'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useState, useEffect } from 'react'
import { Label, RadioGroup, RadioGroupItem } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { LISTENING_A, LISTENING_B, STRUCTURE_B } from '@/feat/test/constant'
import { default as ZoomableImage } from '../zoomable-image'
import { default as AudioPlayer } from '../audio-player'

export const MultipleChoiceForm = ({
  question,
  answers,
  image = '',
  audio = '',
  setTempAnswer,
  answer,
  questionId,
  formId,
  isLoading,
}: {
  question: string
  audio: string
  image: string
  answers: {
    value: string
    id: string
  }[]
  setTempAnswer: Dispatch<SetStateAction<string>>
  answer?: string
  questionId: string
  formId: number
  isLoading: boolean
}) => {
  const [localAnswer, setLocalAnswer] = useState<string>(answer ?? '')
  const optionsLabel = ['A', 'B', 'C', 'D', 'E']

  useEffect(() => {
    setTempAnswer(localAnswer)
  }, [localAnswer, setTempAnswer])

  useEffect(() => {
    setLocalAnswer(answer ?? '')
    // eslint-disable-next-line
  }, [questionId])

  return (
    <div className='flex flex-1 flex-col gap-8 font-bold'>
      <div className={cn('flex gap-4', image && !audio ? 'flex-col-reverse' : 'flex-col')}>
        <h3 className='text-xl whitespace-pre-line'>{question}</h3>
        <div className='flex flex-col items-center justify-center gap-4'>
          <div className='w-full max-w-[910px]'>
            {(formId === STRUCTURE_B || formId === LISTENING_B) && (
              <>
                <div className='mb-2 text-sm font-normal text-slate-500'>Gambar</div>
                <ZoomableImage src={image} alt='test' />
              </>
            )}
            {(formId === LISTENING_A || formId === LISTENING_B) && (
              <>
                <div className='mb-2 text-sm font-normal text-slate-500'>Audio</div>
                <AudioPlayer key={question} audio={audio} />
              </>
            )}
          </div>
        </div>
      </div>
      <RadioGroup
        value={localAnswer}
        onValueChange={setLocalAnswer}
        className='flex flex-col gap-4'
        disabled={isLoading}
      >
        {answers.map((option, idx) => (
          <Label
            className={cn(
              'flex cursor-pointer items-center gap-4 rounded-xl border-2 border-slate-300 p-5',
              localAnswer === option.id && 'border-black bg-[#0116270D]'
            )}
            key={option.id}
            htmlFor={option.id}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <span className='text-lg font-bold'>
              {optionsLabel[idx]}. {option.value}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
