import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { Container } from '@sisfo-remake/ui'
import { getQuizTypeById } from '@/feat/question-bank/question-type/api'
import { Routes } from '@/config'
import { default as QuestionTypeForm } from '@/app/(protected)/bank-soal/_partials/question-type-form'

async function QuestionTypeEditPage(props: ResponseNext<{ id: string }, Pagination>) {
  const { id } = await props.params

  const [{ data: questionType }] = await Promise.all([getQuizTypeById(id)])

  return (
    <Container
      headline='Edit'
      breadcrumbs={{
        items: [
          { aliases: 'Bentuk Soal', path: `${Routes.QuestionBank}${Routes.QuestionType}` },
          { aliases: 'Edit' },
        ],
      }}
    >
      <QuestionTypeForm questionType={questionType} />
    </Container>
  )
}

export default QuestionTypeEditPage
