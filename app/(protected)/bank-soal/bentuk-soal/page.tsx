import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { Container } from '@sisfo-remake/ui'
import { FORM_NUMBER } from '@/feat/question-set/dto'
import { getQuizTypeOrThrow } from '@/feat/question-bank/question-type/api'
import { default as QuestionTypeClient } from '@/app/(protected)/bank-soal/bentuk-soal/client'

async function QuestionTypePage(props: ResponseNext<unknown, Pagination>) {
  const pagination = await props.searchParams
  const { data } = await getQuizTypeOrThrow({ ...pagination, limit: -1 } as Pagination)
  // Belneg hanya memakai Pilihan Ganda & Essay dari bentuk soal Bahasa (lihat FORM_NUMBER)
  const belnegForms = Object.values(FORM_NUMBER)
  const forms = (data?.data ?? []).filter((item) => belnegForms.includes(item.questionForm.id))
  const questionType = { ...data, data: forms, total: forms.length, totalPages: 1, page: 1 }

  return (
    <Container
      hideBackButton
      headline='Bentuk Soal'
      breadcrumbs={{
        items: [
          {
            aliases: 'Bentuk Soal',
          },
        ],
      }}
    >
      <QuestionTypeClient {...{ questionType }} />
    </Container>
  )
}

export default QuestionTypePage
