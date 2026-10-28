import type { TestScheduleDetail } from '@/feat/test-schedule/dto'
import { InfoList } from '@/feat/shared/components/info-list'

/** Ringkasan jadwal di atas tabel "Daftar Siswa" (Penilaian & Hasil) */
export function ScheduleSummary({ schedule }: { schedule: TestScheduleDetail }) {
  return (
    <InfoList
      columns={2}
      className='border-b pb-6'
      items={[
        { label: 'Diklat', value: schedule.course },
        { label: 'Materi', value: schedule.subject },
        { label: 'Tanggal Mulai', value: schedule.startAtLabel },
        { label: 'Tanggal Selesai', value: schedule.endAtLabel },
        { label: 'Durasi', value: `${schedule.duration} Menit` },
        { label: 'Bentuk Soal', value: schedule.formType },
        { label: 'Soal', value: schedule.questionSet },
        { label: 'Tipe Tes', value: schedule.testTypeLabel },
      ]}
    />
  )
}
