import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound, redirect } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { TestScheduleForm } from '@/feat/test-schedule/components/test-schedule-form'
import { getTestScheduleById } from '@/feat/test-schedule/api'
import { getClassroomOptions, getCourseOptions, getSubjectOptions } from '@/feat/shared/api'
import { Routes } from '@/config'

export default async function TestScheduleEditPage(props: ResponseNext<{ id: string }>) {
  const { schedule: permission } = await getPermissionAbility()
  const { id } = await props.params
  const { data: schedule } = await getTestScheduleById(id)

  if (!permission.canManage || !schedule) {
    return notFound()
  }

  // Jadwal yang sudah dimulai hanya dapat dilihat
  if (schedule.isStarted) {
    return redirect(`${Routes.TestSchedule}/${id}`)
  }

  const [{ data: courseOptions }, { data: subjectOptions }, { data: classroomOptions }] =
    await Promise.all([
      getCourseOptions(),
      getSubjectOptions(schedule.courseId),
      getClassroomOptions(schedule.batchId),
    ])

  return (
    <Container
      headline='Edit'
      breadcrumbs={{
        items: [{ aliases: 'Jadwal Tes', path: Routes.TestSchedule }, { aliases: 'Edit' }],
      }}
    >
      <TestScheduleForm
        schedule={schedule}
        courseOptions={courseOptions}
        initialSubjectOptions={subjectOptions}
        initialClassroomOptions={classroomOptions}
      />
    </Container>
  )
}
