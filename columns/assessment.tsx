import type { ColumnDef } from '@tanstack/react-table'
import type { TestScheduleRow } from '@/feat/test-schedule/dto'
import type { ResultRow, WorktestRow } from '@/feat/assessment/dto'
import { Badge, ButtonLink, Icon } from '@sisfo-remake/ui'
import { Routes } from '@/config'

const DetailLink = ({ href }: { href: string }) => (
  <ButtonLink size='icon' variant='outline' href={href} aria-label='Detail'>
    <Icon type='Ikon Detail' />
  </ButtonLink>
)

/** Menu Penilaian — jadwal yang menunggu penilaian */
export const assessmentScheduleColumns: ColumnDef<TestScheduleRow>[] = [
  { accessorKey: 'course', header: () => 'Diklat', size: 220 },
  { accessorKey: 'startAt', header: () => 'Tanggal Mulai', size: 170 },
  { accessorKey: 'endAt', header: () => 'Tanggal Akhir', size: 170 },
  { accessorKey: 'duration', header: () => 'Durasi', size: 110 },
  { accessorKey: 'formType', header: () => 'Bentuk Soal', size: 150 },
  { accessorKey: 'questionSet', header: () => 'Soal', size: 200 },
  {
    id: 'action',
    header: () => 'Aksi',
    size: 80,
    cell: ({ row }) => <DetailLink href={`${Routes.Assessment}/${row.original.id}`} />,
  },
]

/** Menu Hasil — jadwal yang nilainya sudah dikirim */
export const resultScheduleColumns: ColumnDef<TestScheduleRow>[] = [
  { accessorKey: 'course', header: () => 'Diklat', size: 240 },
  { accessorKey: 'startAt', header: () => 'Tanggal Mulai', size: 180 },
  { accessorKey: 'endAt', header: () => 'Tanggal Akhir', size: 180 },
  { accessorKey: 'duration', header: () => 'Durasi', size: 120 },
  { accessorKey: 'questionSet', header: () => 'Soal', size: 220 },
  {
    id: 'action',
    header: () => 'Aksi',
    size: 80,
    cell: ({ row }) => <DetailLink href={`${Routes.Result}/${row.original.id}`} />,
  },
]

export const worktestColumns: ColumnDef<WorktestRow>[] = [
  { accessorKey: 'studentName', header: () => 'Nama Siswa', size: 220 },
  { accessorKey: 'workDate', header: () => 'Tanggal Dikerjakan', size: 160 },
  { accessorKey: 'startTime', header: () => 'Jam Mulai', size: 190 },
  { accessorKey: 'endTime', header: () => 'Jam Selesai', size: 190 },
  {
    accessorKey: 'isGraded',
    header: () => 'Status',
    size: 140,
    cell: ({ row }) => (
      <Badge variant={row.original.isGraded ? 'success-outline' : 'warning-outline'}>
        {row.original.isGraded ? 'Sudah Dinilai' : 'Belum Dinilai'}
      </Badge>
    ),
  },
  { accessorKey: 'score', header: () => 'Nilai', size: 90 },
  {
    id: 'action',
    header: () => 'Aksi',
    size: 80,
    cell: ({ row }) => (
      <DetailLink href={`${Routes.Assessment}/${row.original.scheduleId}/${row.original.id}`} />
    ),
  },
]

export const resultColumns: ColumnDef<ResultRow>[] = [
  { accessorKey: 'studentName', header: () => 'Nama Siswa', size: 400 },
  { accessorKey: 'score', header: () => 'Nilai', size: 300 },
  {
    accessorKey: 'isPassed',
    header: () => 'Status',
    size: 300,
    cell: ({ row }) => (
      <Badge variant={row.original.isPassed ? 'success-outline' : 'warning-outline'}>
        {row.original.isPassed ? 'Lulus' : 'Belum Lulus'}
      </Badge>
    ),
  },
]
