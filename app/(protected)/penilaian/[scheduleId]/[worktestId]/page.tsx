import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { WorktestScoreForm } from '@/feat/assessment/components/worktest-score-form'
import { getWorktestById } from '@/feat/assessment/api'
import { Routes } from '@/config'

export default async function WorktestScorePage(
  props: ResponseNext<{ scheduleId: string; worktestId: string }>
) {
  const { assessment } = await getPermissionAbility()
  const { scheduleId, worktestId } = await props.params
  const { data } = await getWorktestById(worktestId)

  if (!assessment.canManage || !data || `${data.schedule.id}` !== scheduleId) {
    return notFound()
  }

  return (
    <Container
      headline='Nilai'
      breadcrumbs={{
        items: [
          { aliases: 'Penilaian', path: Routes.Assessment },
          { aliases: 'Daftar Siswa', path: `${Routes.Assessment}/${scheduleId}` },
          { aliases: 'Nilai' },
        ],
      }}
    >
      <WorktestScoreForm worktest={data.worktest} schedule={data.schedule} />
    </Container>
  )
}
