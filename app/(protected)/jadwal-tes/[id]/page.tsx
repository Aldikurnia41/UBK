import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { TestScheduleDetailView } from '@/feat/test-schedule/components/test-schedule-detail'
import { getTestScheduleById } from '@/feat/test-schedule/api'
import { Routes } from '@/config'

export default async function TestScheduleDetailPage(props: ResponseNext<{ id: string }>) {
  const { schedule: permission } = await getPermissionAbility()
  const { id } = await props.params
  const { data: schedule } = await getTestScheduleById(id)

  if (!permission.canManage || !schedule) {
    return notFound()
  }

  return (
    <Container
      headline='Detail'
      breadcrumbs={{
        items: [{ aliases: 'Jadwal Tes', path: Routes.TestSchedule }, { aliases: 'Detail' }],
      }}
    >
      <TestScheduleDetailView schedule={schedule} />
    </Container>
  )
}
