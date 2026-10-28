'use client'

import type { CountdownState } from '@/lib/helpers'
import type { StudentProfile, Worktest } from '@/feat/test/dto'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotepadText } from 'lucide-react'
import { Button } from '@sisfo-remake/ui'
import { default as TopBar } from './top-bar'
import { cn, djs } from '@/lib/utils'
import { countdown } from '@/lib/helpers'
import { useConfirmOnBack } from '@/hooks/useConfirmOnBack'
import { default as VideoPlayer } from '@/feat/test/components/video-player'
import { Routes, displayFormName, displayTestType } from '@/config'
import { ModalBack } from '@/app/(test)/tes/[scheduleId]/[worktestId]/_partials/modal-back'

function ClampingDescription({ description }: { description: string }) {
  const [isClamped, setIsClamped] = useState(true)

  return (
    <div>
      <p className={cn('inline', isClamped ? 'line-clamp-4' : '')}>{description} </p>
      <span
        onClick={() => setIsClamped((prev) => !prev)}
        className='text-primary cursor-pointer hover:underline'
      >
        Tampilkan lebih {isClamped ? 'banyak...' : 'sedikit'}
      </span>
    </div>
  )
}

export default function ContentIntro({
  worktest,
  profile,
}: {
  worktest: Worktest
  profile: StudentProfile
}) {
  const { id, schedule, form, amountQuestion } = worktest
  const currDate = djs().add(1, 'minute').format('HH:mm:ss')
  const router = useRouter()
  const TOTAL = 5 // seconds
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  })

  const { showModal: onBack, setShowModal: setOnBack } = useConfirmOnBack(true)

  useEffect(() => {
    countdown(TOTAL, (s) => setState(s))
  }, [])

  const handleNext = () => {
    const nextPath = `${Routes.Test}/${schedule.id}/${id}?current=1`
    router.replace(nextPath)
  }

  return (
    <>
      <ModalBack onBack={onBack} setOnBack={setOnBack} />
      <TopBar
        fullName={profile.fullName}
        nrp={profile.registrationNumber}
        withoutWarning
        endTime={currDate}
        action={handleNext}
        type={displayTestType(schedule.type)}
        course={schedule.course}
        classroom={schedule.class}
        formType={displayFormName(form.name)}
      />
      <div className='flex flex-col items-center justify-center gap-5 p-14'>
        <div className='w-4/5 rounded-lg bg-white p-5 shadow'>
          <div className='mb-3 flex gap-3'>
            <span className='text-primary bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg p-2'>
              <NotepadText />
            </span>
            <div>
              <p className='text-xl font-bold'>{displayFormName(form.name)}</p>
              <p>Jumlah Soal: {amountQuestion}</p>
            </div>
          </div>
          {form.description && <ClampingDescription description={form.description} />}
        </div>
        <div className='flex w-4/5 flex-col'>
          <div className='flex w-full items-center gap-2'>
            <label className='text-sm'>Tutorial Video</label>
            <span className='text-destructive inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-medium'>
              <span className='bg-destructive h-2 w-2 rounded-full'></span>
              Wajib Tonton
            </span>
          </div>

          <div className='flex flex-col items-center justify-center p-3'>
            <VideoPlayer video={form.file} />
          </div>

          <div className='mt-6 flex flex-col items-center gap-3'>
            <Button
              variant='default'
              disabled={!state.finished}
              onClick={handleNext}
              className='h-16 w-full max-w-md'
            >
              Saya sudah paham, lanjut{' '}
              {!state.finished && state.seconds ? (
                <span className='h-6 w-6 rounded-full bg-gray-200 text-black'>
                  {state.seconds}s
                </span>
              ) : (
                ''
              )}
            </Button>
            <span className='text-xs text-slate-500'>
              *Tombol akan aktif setelah 5 detik untuk memastikan informasi terbaca.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
