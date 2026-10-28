'use client'

import type { QuizTestSchedule } from '@/feat/test/dto'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, Spinner } from '@sisfo-remake/ui'
import { nextSection, startOrContinueTestByScheduleId } from '@/feat/test/api'
import { Routes, displayTestType } from '@/config'

interface ScheduleField {
  name: keyof QuizTestSchedule
  label: string
}

export default function TestClient({ schedule }: { schedule: QuizTestSchedule }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const formattedArray: ScheduleField[] = [
    {
      name: 'course',
      label: 'Nama',
    },
    {
      name: 'class',
      label: 'Kelas',
    },
    {
      name: 'type',
      label: 'Tipe Jadwal',
    },
    {
      name: 'question',
      label: 'Soal',
    },
    {
      name: 'date',
      label: 'Tanggal',
    },
    {
      name: 'duration',
      label: 'Durasi',
    },
    {
      name: 'total_questions',
      label: 'Jumlah Pertanyaan',
    },
    {
      name: 'class_master',
      label: 'Class Master',
    },
  ]

  const handleNext = async () => {
    setLoading(true)
    const { data } = await startOrContinueTestByScheduleId({
      scheduleId: schedule.id,
      token: schedule.token,
    })

    setLoading(false)
    if (data) {
      const nextPath = `${Routes.Test}/${schedule.id}/${data.id}/intro`
      if (data.status === 'Not Start') {
        const response = await nextSection(data.id)

        if (response.error) {
          toast.error(response.error.message)
          return
        }

        router.push(nextPath)
      } else {
        router.push(nextPath)
      }
      return
    }

    toast.error('Terjadi kesalahan')
  }

  return (
    <div className='flex h-dvh w-dvw items-center justify-center'>
      <div className='overflow-hidden rounded-lg shadow-lg'>
        <div className='bg-primary p-3 text-center text-xl font-semibold text-white'>
          <h3>Selamat Mengerjakan Soal Ujian Berbasis Komputer</h3>
        </div>
        <div className='w-[800px] bg-white px-8 pt-3 pb-8'>
          <h1 className='mb-5 text-center text-lg font-medium'>Detail Soal</h1>
          {formattedArray.map((value) => (
            <div key={value.name} className='grid grid-cols-3 text-base'>
              <p className='py-3 font-bold'>{value.label}</p>
              <p className='col-span-2'>
                {value.name === 'type' ? displayTestType(schedule.type) : schedule[value.name]}
              </p>
            </div>
          ))}
          <hr className='mt-5 border' />
          <div className='mt-5 grid grid-cols-2 gap-5'>
            <Button variant='default' className='w-full' onClick={handleNext} disabled={loading}>
              {loading ? <Spinner /> : 'Mulai Kerjakan Soal'}
            </Button>
            <Button className='w-full' variant='outline' onClick={() => router.back()}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
