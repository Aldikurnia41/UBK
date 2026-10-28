import type { ResponseNext } from '@sisfo-remake/ui/types'
import { Container } from '@sisfo-remake/ui'
import { QuestionSetForm } from '@/feat/question-set/components/question-set-form'
import { getFormIds, getQuestionCourseOptions } from '@/feat/question-set/api'
import { resolveQuestionSetPage } from '@/app/(protected)/bank-soal/[testType]/_helpers'

export default async function QuestionSetCreatePage(props: ResponseNext<{ testType: string }>) {
  const { testType: segment } = await props.params
  const { testType, title, path } = await resolveQuestionSetPage(segment)
  const [{ data: courseOptions }, { data: formIds }] = await Promise.all([
    getQuestionCourseOptions(),
    getFormIds(),
  ])

  return (
    <Container
      headline='Tambah'
      breadcrumbs={{ items: [{ aliases: title, path }, { aliases: 'Tambah' }] }}
    >
      <QuestionSetForm
        testType={testType}
        courseOptions={courseOptions}
        initialSubjectOptions={[]}
        formIds={formIds}
      />
    </Container>
  )
}
