'use client'

import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { QuestionRow } from '@/feat/question-set/dto'
import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup, ButtonLink, Icon, ModalDelete, toast } from '@sisfo-remake/ui'
import { getTargetPageAfterDelete } from '@/lib/helpers'
import { deleteQuestion } from '@/feat/question-set/api'

function QuestionSetActions({ row, table }: CellContext<QuestionRow, unknown>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const { id } = row.original

  const handleDelete = async () => {
    const page = Number(searchParams.get('page') ?? 1)
    const targetPage = getTargetPageAfterDelete(page, table.getRowCount())
    const { error } = await deleteQuestion(id)

    if (error) {
      return toast.error(error.message)
    }

    setOpen(false)
    toast.success('Berhasil menghapus data')
    router.replace(`${pathname}?page=${targetPage}`, { scroll: false })
  }

  return (
    <ButtonGroup>
      <ButtonLink
        size='icon'
        variant='outline'
        href={`${pathname}/detail/${id}`}
        aria-label='Detail'
      >
        <Icon type='Ikon Detail' />
      </ButtonLink>
      <ButtonLink size='icon' variant='outline' href={`${pathname}/edit/${id}`} aria-label='Edit'>
        <Icon type='Ikon Edit' />
      </ButtonLink>
      <ModalDelete
        trigger={{ asChild: true }}
        root={{ open, onOpenChange: setOpen }}
        submit={{ children: 'Hapus', onClick: handleDelete }}
        cancel={{ children: 'Batal' }}
      >
        <Button size='icon' variant='outline' aria-label='Hapus'>
          <Icon type='Ikon Hapus' />
        </Button>
      </ModalDelete>
    </ButtonGroup>
  )
}

export const questionSetColumns: ColumnDef<QuestionRow>[] = [
  { accessorKey: 'question', header: () => 'Pertanyaan', size: 380 },
  { accessorKey: 'createdAt', header: () => 'Tanggal Dibuat', size: 160 },
  { accessorKey: 'formType', header: () => 'Bentuk Soal', size: 160 },
  { accessorKey: 'testType', header: () => 'Tipe', size: 120 },
  { id: 'action', header: () => 'Aksi', size: 150, cell: QuestionSetActions },
]
