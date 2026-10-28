'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { QuestionRow } from '@/feat/question-set/dto'
import { usePathname } from 'next/navigation'
import { ButtonLink, Icon, TableView } from '@sisfo-remake/ui'
import { FORM_TYPE_OPTIONS } from '@/config'
import { questionSetColumns } from '@/columns/question-set'

// Ekspor tidak disediakan: dokumen pembanding #13 — bank soal Bahasa & Belneg belum punya ekspor
export default function QuestionSetsClient({ data, ...pagination }: Pagination<QuestionRow[]>) {
  const pathname = usePathname()

  return (
    <TableView
      data={data}
      columns={questionSetColumns}
      tooltip={{ cellIds: ['question'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Pertanyaan' }}
      insertBefore={
        <ButtonLink variant='default' href={`${pathname}/tambah`}>
          <Icon type='Ikon Tambah' /> Tambah
        </ButtonLink>
      }
      filter={{
        groups: [
          {
            key: 'formType',
            title: 'Bentuk Soal',
            items: FORM_TYPE_OPTIONS,
            placeholder: { select: 'Pilih Bentuk Soal' },
            combobox: { commandInput: { placeholder: 'Cari Bentuk Soal' } },
          },
        ],
      }}
    />
  )
}
