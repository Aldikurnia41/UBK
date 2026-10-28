import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { getCourseOptions } from '@/feat/shared/api'
import { default as ScheduleTableClient } from '@/feat/assessment/components/schedule-table-client'
import { getResultSchedules } from '@/feat/assessment/api'

export default async function ResultPage(props: ResponseNext<object, SearchParams>) {
  const { assessment } = await getPermissionAbility()

  if (!assessment.canManage) {
    return notFound()
  }

  const [{ data: schedules }, { data: courseOptions }] = await Promise.all([
    getResultSchedules(await props.searchParams),
    getCourseOptions(),
  ])

  return (
    <Container headline='Hasil' breadcrumbs={{ items: [{ aliases: 'Hasil' }] }} hideBackButton>
      <ScheduleTableClient {...schedules} variant='result' courseOptions={courseOptions} />
    </Container>
  )
}
