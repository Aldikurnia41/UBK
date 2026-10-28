import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ResponseNext } from '@sisfo-remake/ui/types'
import { Container } from '@sisfo-remake/ui'
import { default as QuestionSetsClient } from '@/feat/question-set/components/question-sets-client'
import { getQuestions } from '@/feat/question-set/api'
import { resolveQuestionSetPage } from '@/app/(protected)/bank-soal/[testType]/_helpers'

export default async function QuestionSetsPage(
  props: ResponseNext<{ testType: string }, SearchParams>
) {
  const { testType: segment } = await props.params
  const { testType, title } = await resolveQuestionSetPage(segment)
  const { data } = await getQuestions(testType, await props.searchParams)

  return (
    <Container headline={title} breadcrumbs={{ items: [{ aliases: title }] }} hideBackButton>
      <QuestionSetsClient {...data} />
    </Container>
  )
}
