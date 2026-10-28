'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type { TestScheduleRow } from '@/feat/test-schedule/dto'
import { useRouter, useSearchParams } from 'next/navigation'
import { ButtonLink, Icon, TableView, toast } from '@sisfo-remake/ui'
import { useEventSource } from '@/hooks/useEventSource'
import { exportTestSchedules } from '@/feat/test-schedule/api'
import { downloadExportFile } from '@/feat/shared/file'
import { Routes, TEST_TYPE_OPTIONS } from '@/config'
import { testScheduleColumns } from '@/columns/test-schedule'

export default function TestSchedulesClient({
  data,
  courseOptions,
  eventSourceName,
  eventSourceUrl,
  ...pagination
}: Pagination<TestScheduleRow[]> & {
  courseOptions: OptionValue[]
  eventSourceName: string
  eventSourceUrl: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEventSource({
    eventName: eventSourceName,
    eventUrl: eventSourceUrl,
    onMessage: () => router.refresh(),
  })

  const handleExport = async () => {
    const { data: file, error } = await exportTestSchedules(Object.fromEntries(searchParams))
    if (error || !file) return toast.error(error?.message ?? 'Gagal mengekspor data')
    downloadExportFile(file)
  }

  return (
    <TableView
      data={data}
      columns={testScheduleColumns}
      tooltip={{ cellIds: ['course', 'subject', 'questionSet'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Diklat, Materi, atau Soal' }}
      insertBefore={
        <ButtonLink variant='default' href={`${Routes.TestSchedule}/tambah`}>
          <Icon type='Ikon Tambah' /> Tambah
        </ButtonLink>
      }
      exports={{ variant: 'outline', onClick: handleExport }}
      filter={{
        groups: [
          {
            key: 'batchId',
            title: 'Diklat',
            items: courseOptions,
            placeholder: { select: 'Pilih Diklat' },
            combobox: { commandInput: { placeholder: 'Cari Diklat' } },
          },
          {
            key: 'testType',
            title: 'Tipe Tes',
            items: TEST_TYPE_OPTIONS,
            placeholder: { select: 'Pilih Tipe Tes' },
            combobox: { commandInput: { placeholder: 'Cari Tipe Tes' } },
          },
        ],
      }}
    />
  )
}
