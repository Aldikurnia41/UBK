'use client'

import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { TestScheduleRow } from '@/feat/test-schedule/dto'
import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup, ButtonLink, Icon, ModalDelete, toast } from '@sisfo-remake/ui'
import { getTargetPageAfterDelete } from '@/lib/helpers'
import { deleteTestSchedule } from '@/feat/test-schedule/api'
import { Routes } from '@/config'

const LOCKED_HINT = 'Jadwal yang sudah dimulai tidak dapat diubah atau dihapus'

function TestScheduleActions({ row, table }: CellContext<TestScheduleRow, unknown>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const { id, isStarted } = row.original

  const handleDelete = async () => {
    const page = Number(searchParams.get('page') ?? 1)
    const targetPage = getTargetPageAfterDelete(page, table.getRowCount())
    const { error } = await deleteTestSchedule(id)

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
        href={`${Routes.TestSchedule}/${id}`}
        aria-label='Detail'
      >
        <Icon type='Ikon Detail' />
      </ButtonLink>
      {isStarted ? (
        <Button size='icon' variant='outline' disabled title={LOCKED_HINT} aria-label='Edit'>
          <Icon type='Ikon Edit' />
        </Button>
      ) : (
        <ButtonLink
          size='icon'
          variant='outline'
          href={`${Routes.TestSchedule}/${id}/edit`}
          aria-label='Edit'
        >
          <Icon type='Ikon Edit' />
        </ButtonLink>
      )}
      <ModalDelete
        trigger={{ asChild: true, disabled: isStarted }}
        root={{ open, onOpenChange: setOpen }}
        submit={{ children: 'Hapus', onClick: handleDelete }}
        cancel={{ children: 'Batal' }}
      >
        <Button
          size='icon'
          variant='outline'
          disabled={isStarted}
          title={isStarted ? LOCKED_HINT : undefined}
          aria-label='Hapus'
        >
          <Icon type='Ikon Hapus' />
        </Button>
      </ModalDelete>
    </ButtonGroup>
  )
}

export const testScheduleColumns: ColumnDef<TestScheduleRow>[] = [
  { accessorKey: 'course', header: () => 'Diklat', size: 220 },
  { accessorKey: 'subject', header: () => 'Materi', size: 200 },
  { accessorKey: 'questionSet', header: () => 'Soal', size: 200 },
  { accessorKey: 'startAt', header: () => 'Tanggal Mulai', size: 180 },
  { accessorKey: 'endAt', header: () => 'Tanggal Akhir', size: 180 },
  { accessorKey: 'duration', header: () => 'Durasi', size: 100 },
  { id: 'action', header: () => 'Aksi', size: 150, cell: TestScheduleActions },
]

/** Tabel "Jadwal Test" pada Dashboard — seluruh tipe tes dalam satu tabel */
export const dashboardScheduleColumns: ColumnDef<TestScheduleRow>[] = [
  { accessorKey: 'course', header: () => 'Diklat', size: 200 },
  { accessorKey: 'subject', header: () => 'Materi', size: 200 },
  { id: 'author', accessorKey: 'author', header: () => 'Author', size: 160 },
  {
    accessorKey: 'testType',
    header: () => 'Soal',
    size: 140,
    cell: ({ row }) => `Soal ${row.original.testType}`,
  },
  { accessorKey: 'startAt', header: () => 'Tanggal Mulai', size: 170 },
  { accessorKey: 'endAt', header: () => 'Tanggal Akhir', size: 170 },
  { accessorKey: 'duration', header: () => 'Durasi', size: 100 },
]
