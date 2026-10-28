import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound, redirect } from 'next/navigation'
import { default as WorkSpace } from './_partials/workspace'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { studentProfileDTO, worktestDTO } from '@/feat/test/dto'
import { getProfileByMe, startOrContinueTest } from '@/feat/test/api'
import { Routes } from '@/config'

export default async function WorktestPage(
  props: ResponseNext<{ scheduleId: string; worktestId: string }, { page: string; current: string }>
) {
  const { worktest } = await getPermissionAbility()

  if (!worktest.canWorking) {
    return notFound()
  }

  const socket_url = process.env.APP_SOCKET_URL ?? ''
  const socket_path = process.env.APP_SOCKET_PATH ?? ''
  const { worktestId } = await props.params
  const { current = '1', page = '1' } = await props.searchParams

  const [{ data }, { data: profile }] = await Promise.all([
    startOrContinueTest(+worktestId),
    getProfileByMe(),
  ])
  const session = await auth()

  if (!data || !profile) return notFound()

  const response = worktestDTO(data)

  if (!session) return redirect(Routes.Login)

  return (
    <WorkSpace
      {...{
        ...response,
        page: +page,
        current: +current,
        question: response.questions[+current - 1],
        session: session,
        profile: studentProfileDTO(profile),
        socket_url,
        socket_path,
      }}
    />
  )
}
