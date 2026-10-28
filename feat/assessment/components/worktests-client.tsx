'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { WorktestRow } from '@/feat/assessment/dto'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Modal, TableView, toast } from '@sisfo-remake/ui'
import { downloadExportFile } from '@/feat/shared/file'
import { exportWorktests, submitScheduleScores } from '@/feat/assessment/api'
import { Routes } from '@/config'
import { worktestColumns } from '@/columns/assessment'

function SubmitScoreButton({ scheduleId, pending }: { scheduleId: number; pending: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const { error } = await submitScheduleScores(scheduleId)
    setIsSubmitting(false)

    if (error) {
      return toast.error(error.message)
    }

    setOpen(false)
    toast.success('Nilai berhasil dikirim. Data dipindahkan ke menu Hasil.')
    router.push(`${Routes.Result}/${scheduleId}`)
  }

  return (
    <Modal
      root={{ open, onOpenChange: setOpen }}
      trigger={{ asChild: true }}
      title={{ children: 'Kirim Nilai?' }}
      description={{
        children: pending
          ? `Masih ada ${pending} siswa yang belum dinilai. Lengkapi penilaian terlebih dahulu.`
          : 'Setelah dikirim, nilai tidak dapat diubah dan akan tampil pada menu Hasil.',
      }}
      submit={{
        children: 'Kirim',
        disabled: isSubmitting || pending > 0,
        onClick: (event) => {
          event.preventDefault()
          handleSubmit()
        },
      }}
      cancel={{ children: 'Batal' }}
    >
      <Button variant='default'>Kirim Nilai</Button>
    </Modal>
  )
}

export default function WorktestsClient({
  scheduleId,
  pendingCount,
  data,
  ...pagination
}: Pagination<WorktestRow[]> & { scheduleId: number; pendingCount: number }) {
  const searchParams = useSearchParams()

  const handleExport = async () => {
    const { data: file, error } = await exportWorktests(
      scheduleId,
      Object.fromEntries(searchParams)
    )
    if (error || !file) return toast.error(error?.message ?? 'Gagal mengekspor data')
    downloadExportFile(file)
  }

  return (
    <TableView
      data={data}
      columns={worktestColumns}
      tooltip={{ cellIds: ['studentName'] }}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Nama Siswa' }}
      insertBefore={<SubmitScoreButton scheduleId={scheduleId} pending={pendingCount} />}
      exports={{ variant: 'outline', onClick: handleExport }}
      filter={{
        groups: [
          {
            key: 'isCalculated',
            title: 'Status',
            items: [
              { value: 'true', label: 'Sudah Dinilai' },
              { value: 'false', label: 'Belum Dinilai' },
            ],
            placeholder: { select: 'Pilih Status' },
            combobox: { commandInput: { placeholder: 'Cari Status' } },
          },
        ],
      }}
    />
  )
}
