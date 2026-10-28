'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { ResultRow } from '@/feat/assessment/dto'
import { useSearchParams } from 'next/navigation'
import { TableView, toast } from '@sisfo-remake/ui'
import { downloadExportFile } from '@/feat/shared/file'
import { exportWorktests } from '@/feat/assessment/api'
import { resultColumns } from '@/columns/assessment'

export default function ResultsClient({
  scheduleId,
  data,
  ...pagination
}: Pagination<ResultRow[]> & { scheduleId: number }) {
  const searchParams = useSearchParams()

  const handleExport = async () => {
    const { data: file, error } = await exportWorktests(
      scheduleId,
      Object.fromEntries(searchParams)
    )
    if (error || !file) return toast.error(error?.message ?? 'Gagal mengekspor data')
    downloadExportFile(file)
  }

  return (
    <TableView
      data={data}
      columns={resultColumns}
      tooltip={{ cellIds: ['studentName'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Nama Siswa' }}
      exports={{ variant: 'outline', onClick: handleExport }}
      filter={{
        groups: [
          {
            key: 'isPassed',
            title: 'Status',
            items: [
              { value: 'true', label: 'Lulus' },
              { value: 'false', label: 'Belum Lulus' },
            ],
            placeholder: { select: 'Pilih Status' },
            combobox: { commandInput: { placeholder: 'Cari Status' } },
          },
        ],
      }}
    />
  )
}
