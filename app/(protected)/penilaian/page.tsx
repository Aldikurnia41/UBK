import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { getCourseOptions } from '@/feat/shared/api'
import { default as ScheduleTableClient } from '@/feat/assessment/components/schedule-table-client'
import { getAssessmentSchedules } from '@/feat/assessment/api'

export default async function AssessmentPage(props: ResponseNext<object, SearchParams>) {
  const { assessment } = await getPermissionAbility()

  if (!assessment.canManage) {
    return notFound()
  }

  const [{ data: schedules }, { data: courseOptions }] = await Promise.all([
    getAssessmentSchedules(await props.searchParams),
    getCourseOptions(),
  ])

  return (
    <Container
      headline='Penilaian'
      breadcrumbs={{ items: [{ aliases: 'Penilaian' }] }}
      hideBackButton
    >
      <ScheduleTableClient {...schedules} variant='assessment' courseOptions={courseOptions} />
    </Container>
  )
}
