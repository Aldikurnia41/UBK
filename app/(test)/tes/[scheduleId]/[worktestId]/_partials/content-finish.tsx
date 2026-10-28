'use client'

import type { WorktestResult } from '@/feat/test/dto'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, CircleCheckBigIcon, Timer } from 'lucide-react'
import { Button, Icon } from '@sisfo-remake/ui'
import { useConfirmOnBack } from '@/hooks/useConfirmOnBack'
import { Routes, displayTestType } from '@/config'

export default function ContentFinish({ worktest }: { worktest: WorktestResult }) {
  const router = useRouter()
  const { showModal: onBack } = useConfirmOnBack(true)

  useEffect(() => {
    if (onBack) {
      router.replace(Routes.Test)
    }
  }, [onBack, router, worktest])

  return (
    <>
      <div className='flex h-dvh w-dvw items-center justify-center'>
        <div className='overflow-hidden rounded-lg shadow-lg'>
          <div className='w-4xl bg-white'>
            <div className='flex flex-col items-center justify-center gap-6 py-12'>
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-[#D1FAE5]'>
                <BadgeCheck className='h-14 w-14 text-[#059669]' />
              </div>
              <h1 className='text-primary text-3xl font-bold'>
                {displayTestType(worktest.type)} Berhasil Diselesaikan
              </h1>
              <p className='w-lg text-center'>
                Selamat! Anda telah menyelesaikan sesi {displayTestType(worktest.type)}{' '}
                <span className='font-bold'>{worktest.course}</span> dengan sukses. Semua jawaban
                Anda telah tersimpan dengan aman di sistem pusat.
              </p>
            </div>
            <div className='grid grid-cols-3 border-y border-slate-300 bg-[#F8FAFC80]/50'>
              <div className='flex flex-col items-center justify-center gap-2.5 pb-9'>
                <div className='flex flex-col items-center gap-2 pt-4'>
                  <Icon type='Ikon Manajemen Kuis' className='h-5 w-5' size={20} />
                  <p>Sesi</p>
                </div>
                <p className='text-2xl font-bold'>{displayTestType(worktest.type)}</p>
              </div>
              <div className='flex flex-col items-center justify-center gap-2.5 border-x border-slate-300 pb-8'>
                <div className='flex flex-col items-center gap-2 pt-8'>
                  <CircleCheckBigIcon />
                  <p>Ringkasan Pengerjaan</p>
                </div>
                <p className='w-2/3 text-center text-2xl font-bold'>{worktest.answered}</p>
              </div>
              <div className='flex flex-col items-center justify-center gap-2.5 pb-9'>
                <div className='flex flex-col items-center gap-2 pt-4'>
                  <Timer />
                  <p>Waktu Pengerjaan</p>
                </div>
                <p className='text-2xl font-bold'>{worktest.duration}</p>
              </div>
            </div>
            <div className='flex items-center justify-center p-8'>
              <div className='w-full max-w-2xl rounded-xl border border-slate-300 bg-slate-300/15 px-14 py-6 text-center'>
                "Terima kasih telah menjunjung tinggi nilai kejujuran selama pelaksanaan. Jawaban
                Anda akan segera diproses untuk penilaian otomatis."
              </div>
            </div>
            <div className='flex justify-center border-t border-slate-300 bg-[#F8FAFC80]/50 p-8'>
              <Button
                variant='default'
                className='w-full max-w-md'
                onClick={() => router.replace(Routes.Dashboard)}
              >
                <Icon type='Ikon Beranda' /> Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
