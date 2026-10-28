import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getEventSourceUrl, getPermissionAbility } from '@/lib/helpers'
import { getStudentTestSchedules } from '@/feat/test/api'
import { EventSourceName } from '@/config'
import { default as StudentSchedulesClient } from '@/app/(protected)/tes/client'

export default async function StudentTestSchedulesPage(
  props: ResponseNext<object, Record<string, string>>
) {
  const { worktest } = await getPermissionAbility()

  if (!worktest.canWorking) {
    return notFound()
  }

  const { data } = await getStudentTestSchedules(await props.searchParams)

  return (
    <Container
      headline='Jadwal Tes'
      breadcrumbs={{ items: [{ aliases: 'Jadwal Tes' }] }}
      hideBackButton
    >
      <StudentSchedulesClient
        {...data}
        eventSourceName={EventSourceName.ExamSchedule}
        eventSourceUrl={getEventSourceUrl(
          process.env.APP_API_SCHEDULE_TEST,
          EventSourceName.ExamSchedule
        )}
      />
    </Container>
  )
}
