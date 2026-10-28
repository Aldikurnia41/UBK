'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { StudentTestSchedule } from '@/feat/test/dto'
import { StartTestButton } from '@/feat/test/components/token-modal'

/** Jadwal Tes siswa (Figma "Siswa - UBK / Jadwal Tes") */
export const studentTestScheduleColumns: ColumnDef<StudentTestSchedule>[] = [
  { accessorKey: 'course', header: () => 'Diklat', size: 220 },
  { accessorKey: 'subject', header: () => 'Materi', size: 200 },
  { accessorKey: 'questionSet', header: () => 'Soal', size: 160 },
  { accessorKey: 'startAt', header: () => 'Tanggal Mulai', size: 170 },
  { accessorKey: 'endAt', header: () => 'Tanggal Akhir', size: 170 },
  { accessorKey: 'duration', header: () => 'Durasi', size: 100 },
  {
    id: 'action',
    header: () => 'Aksi',
    size: 150,
    cell: ({ row }) => <StartTestButton schedule={row.original} />,
  },
]
