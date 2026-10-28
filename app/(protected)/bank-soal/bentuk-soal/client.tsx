'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { QuestionType } from '@/feat/question-bank/question-type/dto'
import { TableView } from '@sisfo-remake/ui'
import { quizTypeColumnn } from '@/columns/question-type'

interface QuestionTypeClientProps {
  questionType: Pagination<QuestionType[]>
}

function QuestionTypeClient({ questionType }: QuestionTypeClientProps) {
  const { data, ...pagination } = questionType

  return (
    <TableView
      columns={quizTypeColumnn}
      tooltip={{ cellIds: ['questionForm', 'file'] }}
      data={data}
      pagination={{ searchParams: pagination, keyString: { searchKey: 'search' } }}
      keepInputFocus={true}
      search={{
        placeholder: 'Cari Bentuk Soal',
      }}
    />
  )
}

export default QuestionTypeClient
