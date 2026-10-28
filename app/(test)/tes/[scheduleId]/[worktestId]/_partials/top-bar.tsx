'use client'

import { useEffect } from 'react'
import { default as Image } from 'next/image'
import { cn } from '@/lib/utils'
import { useCountdown } from '@/hooks/useCountdown'

export default function TopBar({
  endTime,
  withoutWarning = false,
  fullName = '',
  nrp = '',
  action,
  type,
  course,
  classroom,
  formType,
}: {
  endTime: string
  withoutWarning?: boolean
  fullName?: string
  nrp?: string
  type: string
  course: string
  classroom: string
  formType: string
  action?: () => void
}) {
  const { hours, minutes, seconds, timeLeft } = useCountdown(endTime)
  const isTimeout = hours <= 0 && minutes < 5

  useEffect(() => {
    if (action && timeLeft <= 0) {
      action()
      return
    }
  }, [action, timeLeft])

  return (
    <div className='grid h-full grid-cols-1 bg-white shadow 2xl:grid-cols-[6fr_4fr]'>
      <div className='flex items-center gap-5 border-b-2 p-4 2xl:border-0'>
        <div>
          <Image src='/logo.png' alt='logo' width={100} height={100} className='h-11 w-11' />
        </div>
        <div>
          <p className='text-primary text-lg font-bold'>
            {type} - {course}
          </p>
          <p className='text-sm'>
            {classroom} - {formType}
          </p>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_1fr]'>
        <div className='w-full rounded-md border border-gray-300 px-4 py-2'>
          <p className='text-primary text-lg font-bold'>{fullName}</p>
          <p className='text-sm'>NRP/NIM: {nrp}</p>
        </div>
        <div
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-md bg-gray-200 px-5 py-1 transition-colors',
            !withoutWarning && isTimeout && 'bg-destructive text-white'
          )}
        >
          <div className='flex items-center gap-3'>
            <span className='text-[28px] font-bold'>{hours.toString().padStart(2, '0')}</span>
            <span className='text-sm'>Jam</span>
            <span className='text-[28px] font-bold'>:</span>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-[28px] font-bold'>{minutes.toString().padStart(2, '0')}</span>
            <span className='text-sm'>Menit</span>
            <span className='text-[28px] font-bold'>:</span>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-[28px] font-bold'>{seconds.toString().padStart(2, '0')}</span>
            <span className='text-sm'>Detik</span>
          </div>
        </div>
      </div>
    </div>
  )
}
