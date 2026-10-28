import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { QuestionType } from '@/feat/question-bank/question-type/dto'
import { ButtonGroup, ButtonLink, Icon } from '@sisfo-remake/ui'
import { Routes } from '@/config'

const ActionButtonQuizTypeColumnn: React.FC<CellContext<QuestionType, unknown>> = ({ row }) => {
  return (
    <ButtonGroup>
      <ButtonLink
        size='icon'
        variant='outline'
        href={`${Routes.QuestionBank}${Routes.QuestionType}/detail/${row.original.id}`}
      >
        <Icon type='Ikon Detail' />
      </ButtonLink>
      <ButtonLink
        size='icon'
        variant='outline'
        href={`${Routes.QuestionBank}${Routes.QuestionType}/edit/${row.original.id}`}
      >
        <Icon type='Ikon Edit' />
      </ButtonLink>
    </ButtonGroup>
  )
}

export const quizTypeColumnn: ColumnDef<QuestionType>[] = [
  {
    accessorKey: 'questionForm',
    header: () => 'Bentuk Soal',
    cell: ({ row }) => row.original.questionForm.text,
    size: 375,
  },
  {
    accessorKey: 'action',
    header: () => 'Aksi',
    cell: ActionButtonQuizTypeColumnn,
  },
]
