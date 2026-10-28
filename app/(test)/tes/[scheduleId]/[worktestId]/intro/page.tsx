import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { getPermissionAbility } from '@/lib/helpers'
import { studentProfileDTO, worktestDTO } from '@/feat/test/dto'
import { getProfileByMe, startOrContinueTest } from '@/feat/test/api'
import { default as ContentIntro } from '../_partials/content-intro'

export default async function IntroPage(props: ResponseNext<{ worktestId: string }>) {
  const { worktest } = await getPermissionAbility()

  if (!worktest.canWorking) {
    return notFound()
  }

  const { worktestId } = await props.params

  const [{ data }, { data: profile }] = await Promise.all([
    startOrContinueTest(+worktestId),
    getProfileByMe(),
  ])

  if (!data || !profile) return notFound()

  return <ContentIntro worktest={worktestDTO(data)} profile={studentProfileDTO(profile)} />
}
