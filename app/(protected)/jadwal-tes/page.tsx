import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getEventSourceUrl, getPermissionAbility } from '@/lib/helpers'
import { default as TestSchedulesClient } from '@/feat/test-schedule/components/test-schedules-client'
import { getTestSchedules } from '@/feat/test-schedule/api'
import { getCourseOptions } from '@/feat/shared/api'
import { EventSourceName } from '@/config'

export default async function TestSchedulesPage(props: ResponseNext<object, SearchParams>) {
  const { schedule } = await getPermissionAbility()

  if (!schedule.canManage) {
    return notFound()
  }

  const searchParams = await props.searchParams
  const [{ data: schedules }, { data: courseOptions }] = await Promise.all([
    getTestSchedules(searchParams),
    getCourseOptions(),
  ])

  return (
    <Container
      headline='Jadwal Tes'
      breadcrumbs={{ items: [{ aliases: 'Jadwal Tes' }] }}
      hideBackButton
    >
      <TestSchedulesClient
        {...schedules}
        courseOptions={courseOptions}
        eventSourceName={EventSourceName.ExamSchedule}
        eventSourceUrl={getEventSourceUrl(
          process.env.APP_API_SCHEDULE_TEST,
          EventSourceName.ExamSchedule
        )}
      />
    </Container>
  )
}
