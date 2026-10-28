import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { getTestScheduleById } from '@/feat/test-schedule/api'
import { ScheduleSummary } from '@/feat/assessment/components/schedule-summary'
import { default as ResultsClient } from '@/feat/assessment/components/results-client'
import { getResultsBySchedule } from '@/feat/assessment/api'
import { Routes } from '@/config'

export default async function ResultStudentsPage(
  props: ResponseNext<{ scheduleId: string }, SearchParams>
) {
  const { assessment } = await getPermissionAbility()
  const { scheduleId } = await props.params
  const { data: schedule } = await getTestScheduleById(scheduleId)

  if (!assessment.canManage || !schedule?.isCalculated) {
    return notFound()
  }

  const { data: results } = await getResultsBySchedule(scheduleId, await props.searchParams)

  return (
    <Container
      headline='Daftar Siswa'
      breadcrumbs={{
        items: [{ aliases: 'Hasil', path: Routes.Result }, { aliases: 'Daftar Siswa' }],
      }}
      contentProps={{ className: 'flex flex-col gap-6' }}
    >
      <ScheduleSummary schedule={schedule} />
      <ResultsClient {...results} scheduleId={schedule.id} />
    </Container>
  )
}
