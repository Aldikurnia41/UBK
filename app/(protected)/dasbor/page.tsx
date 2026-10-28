import type { ResponseNext } from '@sisfo-remake/ui/types'
import { Container, Icon } from '@sisfo-remake/ui'
import { djs } from '@/lib/utils'
import { getPermissionAbility } from '@/lib/helpers'
import { getTestSchedules } from '@/feat/test-schedule/api'
import { getStudentTestSchedules } from '@/feat/test/api'
import { AverageScoreChart } from '@/feat/dashboard/components/average-score-chart'
import { getDashboard } from '@/feat/dashboard/api'
import { default as DashboardScheduleClient } from '@/app/(protected)/dasbor/client'

export default async function DashboardPage(
  props: ResponseNext<object, { year?: string; q?: string; page?: string }>
) {
  const { year: yearParam, q, page } = await props.searchParams
  const { schedule, worktest } = await getPermissionAbility()

  if (worktest.canWorking && !schedule.canManage) {
    return <StudentDashboard q={q} page={page} />
  }

  const currentYear = djs().year()
  const year = Number(yearParam) || currentYear
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index)

  const [{ data: dashboard }, { data: schedules }] = await Promise.all([
    getDashboard(year),
    // Jadwal tes yang sedang berlangsung & akan datang, seluruh tipe tes dalam satu tabel
    getTestSchedules({ q, page, status: ['present', 'future'], sort: 'date', sortType: 'asc' }),
  ])

  const cards = [
    { name: 'Jumlah Soal Pretest', total: dashboard.countPretestQuestion },
    { name: 'Jumlah Soal Posttest', total: dashboard.countPosttestQuestion },
    { name: 'Jumlah Soal Kuis', total: dashboard.countQuizQuestion },
  ]

  return (
    <DashboardShell cards={cards}>
      <AverageScoreChart data={dashboard.averageScores} year={year} years={years} />
      <DashboardScheduleClient {...schedules} />
    </DashboardShell>
  )
}

/** Dashboard siswa (Figma "Siswa - UBK / Beranda") */
async function StudentDashboard({ q, page }: { q?: string; page?: string }) {
  const [{ data: upcoming }, { data: taken }] = await Promise.all([
    getStudentTestSchedules({ q, page }),
    getStudentTestSchedules({ limit: '1' }, ['past']),
  ])

  const cards = [
    { name: 'Jadwal Tes Aktif', total: upcoming.total ?? upcoming.data.length },
    { name: 'Tes Yang Diikuti', total: taken.total ?? taken.data.length },
  ]

  return (
    <DashboardShell cards={cards}>
      <DashboardScheduleClient {...upcoming} hideAuthor />
    </DashboardShell>
  )
}

function DashboardShell({
  cards,
  children,
}: React.PropsWithChildren<{ cards: { name: string; total: number }[] }>) {
  return (
    <Container
      headline='Dashboard'
      breadcrumbs={{ items: [{ aliases: 'Dashboard' }] }}
      contentProps={{ className: 'bg-transparent p-0 md:p-0 flex flex-col gap-6' }}
      hideBackButton
    >
      <div>
        <h2 className='text-xl font-bold'>Selamat Datang</h2>
        <hr className='mt-3 border-t-[3px] border-black' />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-[repeat(3,minmax(0,20rem))]'>
        {cards.map((card) => (
          <div
            key={card.name}
            className='bg-card flex items-center justify-between gap-3 rounded-md p-5 font-bold'
          >
            <p className='flex items-center gap-3 leading-5'>
              <span className='bg-primary flex size-10 shrink-0 items-center justify-center rounded-md'>
                <Icon type='Ikon Bank Soal' className='size-6 text-white' />
              </span>
              <span>{card.name}</span>
            </p>
            <p className='text-2xl tabular-nums'>{card.total}</p>
          </div>
        ))}
      </div>

      {children}
    </Container>
  )
}
