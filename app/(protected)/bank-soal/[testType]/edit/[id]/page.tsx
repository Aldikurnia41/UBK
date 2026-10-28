import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getSubjectOptions } from '@/feat/shared/api'
import { QuestionSetForm } from '@/feat/question-set/components/question-set-form'
import { getFormIds, getQuestionById, getQuestionCourseOptions } from '@/feat/question-set/api'
import { resolveQuestionSetPage } from '@/app/(protected)/bank-soal/[testType]/_helpers'

export default async function QuestionSetEditPage(
  props: ResponseNext<{ testType: string; id: string }>
) {
  const { testType: segment, id } = await props.params
  const { testType, title, path } = await resolveQuestionSetPage(segment)
  const { data: question } = await getQuestionById(id, testType)

  if (!question) {
    return notFound()
  }

  const [{ data: courseOptions }, { data: subjectOptions }, { data: formIds }] = await Promise.all([
    getQuestionCourseOptions(),
    getSubjectOptions(question.courseId),
    getFormIds(),
  ])

  return (
    <Container
      headline='Edit'
      breadcrumbs={{ items: [{ aliases: title, path }, { aliases: 'Edit' }] }}
    >
      <QuestionSetForm
        testType={testType}
        questionSet={question}
        courseOptions={courseOptions}
        initialSubjectOptions={subjectOptions}
        formIds={formIds}
      />
    </Container>
  )
}
