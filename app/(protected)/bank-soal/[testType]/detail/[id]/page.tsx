import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { QuestionSetDetailView } from '@/feat/question-set/components/question-set-detail'
import { getQuestionById } from '@/feat/question-set/api'
import { resolveQuestionSetPage } from '@/app/(protected)/bank-soal/[testType]/_helpers'

export default async function QuestionSetDetailPage(
  props: ResponseNext<{ testType: string; id: string }>
) {
  const { testType: segment, id } = await props.params
  const { testType, title, path } = await resolveQuestionSetPage(segment)
  const { data: question } = await getQuestionById(id, testType)

  if (!question) {
    return notFound()
  }

  return (
    <Container
      headline='Detail'
      breadcrumbs={{ items: [{ aliases: title, path }, { aliases: 'Detail' }] }}
    >
      <QuestionSetDetailView question={question} />
    </Container>
  )
}
