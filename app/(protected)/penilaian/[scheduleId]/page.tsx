import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound, redirect } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { getTestScheduleById } from '@/feat/test-schedule/api'
import { default as WorktestsClient } from '@/feat/assessment/components/worktests-client'
import { ScheduleSummary } from '@/feat/assessment/components/schedule-summary'
import { getWorktestsBySchedule } from '@/feat/assessment/api'
import { Routes } from '@/config'

export default async function AssessmentStudentsPage(
  props: ResponseNext<{ scheduleId: string }, SearchParams>
) {
  const { assessment } = await getPermissionAbility()
  const { scheduleId } = await props.params
  const { data: schedule } = await getTestScheduleById(scheduleId)

  if (!assessment.canManage || !schedule) {
    return notFound()
  }

  // Nilai sudah dikirim → lihat di menu Hasil
  if (schedule.isCalculated) {
    return redirect(`${Routes.Result}/${scheduleId}`)
  }

  const [{ data: worktests }, { data: pending }] = await Promise.all([
    getWorktestsBySchedule(scheduleId, await props.searchParams),
    getWorktestsBySchedule(scheduleId, { isCalculated: 'false', limit: '1' }),
  ])

  return (
    <Container
      headline='Daftar Siswa'
      breadcrumbs={{
        items: [{ aliases: 'Penilaian', path: Routes.Assessment }, { aliases: 'Daftar Siswa' }],
      }}
      contentProps={{ className: 'flex flex-col gap-6' }}
    >
      <ScheduleSummary schedule={schedule} />
      <WorktestsClient {...worktests} scheduleId={schedule.id} pendingCount={pending.total ?? 0} />
    </Container>
  )
}
