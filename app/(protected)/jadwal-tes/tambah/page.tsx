import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { TestScheduleForm } from '@/feat/test-schedule/components/test-schedule-form'
import { getCourseOptions } from '@/feat/shared/api'
import { Routes } from '@/config'

export default async function TestScheduleCreatePage() {
  const { schedule } = await getPermissionAbility()

  if (!schedule.canManage) {
    return notFound()
  }

  const { data: courseOptions } = await getCourseOptions()

  return (
    <Container
      headline='Tambah'
      breadcrumbs={{
        items: [{ aliases: 'Jadwal Tes', path: Routes.TestSchedule }, { aliases: 'Tambah' }],
      }}
    >
      <TestScheduleForm courseOptions={courseOptions} initialSubjectOptions={[]} />
    </Container>
  )
}
