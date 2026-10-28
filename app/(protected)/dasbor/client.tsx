'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { TestScheduleRow } from '@/feat/test-schedule/dto'
import { TableView } from '@sisfo-remake/ui'
import { dashboardScheduleColumns } from '@/columns/test-schedule'

export default function DashboardScheduleClient({
  data,
  hideAuthor = false,
  ...pagination
}: Pagination<TestScheduleRow[]> & { hideAuthor?: boolean }) {
  const columns = hideAuthor
    ? dashboardScheduleColumns.filter((column) => column.id !== 'author')
    : dashboardScheduleColumns

  return (
    <section className='bg-card flex flex-col gap-4 rounded-md p-5'>
      <TableView
        data={data}
        columns={columns}
        tooltip={{ cellIds: ['course', 'subject'] }}
        pagination={{ searchParams: pagination }}
        search={{ placeholder: 'Cari Materi' }}
        insertBefore={<h2 className='self-center font-bold'>Jadwal Test</h2>}
      />
    </section>
  )
}
