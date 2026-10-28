'use client'

import type { TestScheduleDetail } from '@/feat/test-schedule/dto'
import { useTransition } from 'react'
import { ClipboardCopy } from 'lucide-react'
import { Button, Spinner, toast } from '@sisfo-remake/ui'
import { exportTestScheduleById } from '@/feat/test-schedule/api'
import { downloadExportFile } from '@/feat/shared/file'
import { InfoList } from '@/feat/shared/components/info-list'

function TokenValue({ token }: { token: string }) {
  if (!token) return '-'

  return (
    <span className='inline-flex items-center gap-3'>
      <span className='font-mono'>{token}</span>
      <button
        type='button'
        className='text-primary hover:text-primary/80 rounded-sm'
        aria-label='Salin token'
        onClick={async () => {
          await navigator.clipboard.writeText(token)
          toast.success('Token berhasil disalin')
        }}
      >
        <ClipboardCopy className='size-4' />
      </button>
    </span>
  )
}

export function TestScheduleDetailView({ schedule }: { schedule: TestScheduleDetail }) {
  const [isExporting, startExport] = useTransition()

  return (
    <div className='flex flex-col gap-6'>
      <InfoList
        items={[
          { label: 'Diklat', value: schedule.course },
          { label: 'Materi', value: schedule.subject },
          { label: 'Soal', value: schedule.questionSet },
          { label: 'Tipe Tes', value: schedule.testTypeLabel },
          { label: 'Bentuk Soal', value: schedule.formType },
          { label: 'Tanggal Mulai', value: schedule.startAtLabel },
          { label: 'Tanggal Selesai', value: schedule.endAtLabel },
          { label: 'Durasi', value: `${schedule.duration} Menit` },
          { label: 'Author', value: schedule.author },
          { label: 'Token', value: <TokenValue token={schedule.token} /> },
        ]}
      />
      <div className='flex justify-end'>
        <Button
          variant='default'
          disabled={isExporting}
          onClick={() =>
            startExport(async () => {
              const { data, error } = await exportTestScheduleById(schedule.id)
              if (error || !data) return void toast.error(error?.message ?? 'Gagal mengekspor data')
              downloadExportFile(data)
            })
          }
        >
          {isExporting && <Spinner />}
          Ekspor
        </Button>
      </div>
    </div>
  )
}
