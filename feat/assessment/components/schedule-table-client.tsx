'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type { TestScheduleRow } from '@/feat/test-schedule/dto'
import { useSearchParams } from 'next/navigation'
import { TableView, toast } from '@sisfo-remake/ui'
import { exportTestSchedules } from '@/feat/test-schedule/api'
import { downloadExportFile } from '@/feat/shared/file'
import { TEST_TYPE_OPTIONS } from '@/config'
import { assessmentScheduleColumns, resultScheduleColumns } from '@/columns/assessment'

const VARIANT = {
  assessment: {
    columns: assessmentScheduleColumns,
    exportFilter: { status: 'past', isCalculated: 'false' },
  },
  result: {
    columns: resultScheduleColumns,
    exportFilter: { status: 'all', isCalculated: 'true' },
  },
}

/** Daftar jadwal pada menu Penilaian (`variant="assessment"`) dan Hasil (`variant="result"`) */
export default function ScheduleTableClient({
  variant,
  data,
  courseOptions,
  ...pagination
}: Pagination<TestScheduleRow[]> & {
  variant: keyof typeof VARIANT
  courseOptions: OptionValue[]
}) {
  const searchParams = useSearchParams()
  const { columns, exportFilter } = VARIANT[variant]

  const handleExport = async () => {
    const { data: file, error } = await exportTestSchedules({
      ...Object.fromEntries(searchParams),
      ...exportFilter,
    })
    if (error || !file) return toast.error(error?.message ?? 'Gagal mengekspor data')
    downloadExportFile(file)
  }

  return (
    <TableView
      data={data}
      columns={columns}
      tooltip={{ cellIds: ['course', 'questionSet'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Diklat atau Soal' }}
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
