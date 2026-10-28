'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { StudentTestSchedule } from '@/feat/test/dto'
import { useRouter } from 'next/navigation'
import { TableView } from '@sisfo-remake/ui'
import { useEventSource } from '@/hooks/useEventSource'
import { TEST_TYPE_OPTIONS } from '@/config'
import { studentTestScheduleColumns } from '@/columns/test'

export default function StudentSchedulesClient({
  data,
  eventSourceName,
  eventSourceUrl,
  ...pagination
}: Pagination<StudentTestSchedule[]> & { eventSourceName: string; eventSourceUrl: string }) {
  const router = useRouter()

  useEventSource({
    eventName: eventSourceName,
    eventUrl: eventSourceUrl,
    onMessage: () => router.refresh(),
  })

  return (
    <TableView
      data={data}
      columns={studentTestScheduleColumns}
      tooltip={{ cellIds: ['course', 'subject'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Nama' }}
      filter={{
        groups: [
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
