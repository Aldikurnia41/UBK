import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { getPermissionAbility } from '@/lib/helpers'
import { worktestResultDTO } from '@/feat/test/dto'
import { getFinishWorktestById } from '@/feat/test/api'
import { default as ContentFinish } from '../_partials/content-finish'

export default async function FinishPage(
  props: ResponseNext<{ scheduleId: string; worktestId: string }>
) {
  const { worktest } = await getPermissionAbility()

  console.log('WORKTEST CONSOLE: ', worktest)
  if (!worktest.canWorking) {
    return notFound()
  }

  const { worktestId } = await props.params

  const { data } = await getFinishWorktestById(+worktestId)
  console.log('DATA CONSOLE: ', data)

  if (!data) return notFound()

  return <ContentFinish worktest={worktestResultDTO(data)} />
}
