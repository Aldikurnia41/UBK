import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { default as TestClient } from './client'
import { getPermissionAbility } from '@/lib/helpers'
import { quizTestScheduleDTO } from '@/feat/test/dto'
import { getQuizTestScheduleById } from '@/feat/test/api'

export default async function TestPage(props: ResponseNext<{ scheduleId: string }>) {
  const { worktest } = await getPermissionAbility()

  if (!worktest.canWorking) {
    return notFound()
  }

  const { scheduleId } = await props.params

  const { data: schedule } = await getQuizTestScheduleById(+scheduleId)

  if (!schedule) return notFound()

  return <TestClient schedule={quizTestScheduleDTO(schedule)} />
}
