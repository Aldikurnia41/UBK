'use client'

import type { DashboardResponse } from '@/feat/dashboard/api'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sisfo-remake/ui'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: DashboardResponse['averageScores'][number] }[]
}) {
  if (!active || !payload?.length) return null
  const { subjectName, average } = payload[0].payload

  return (
    <div className='bg-background max-w-64 rounded-sm border px-3 py-2 text-sm shadow-sm'>
      <p className='font-medium'>{subjectName}</p>
      <p className='text-muted-foreground flex items-center gap-2'>
        <span aria-hidden className='bg-chart-bar size-2.5 rounded-xs' />
        Rata-Rata Nilai: <span className='text-foreground font-medium'>{average}</span>
      </p>
    </div>
  )
}

export function AverageScoreChart({
  data,
  year,
  years,
}: {
  data: DashboardResponse['averageScores']
  year: number
  years: number[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const changeYear = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('year', value)
    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <section className='bg-card flex flex-col gap-4 rounded-md p-5'>
      <header className='grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]'>
        <h2 className='font-bold sm:col-start-2'>Rata-Rata Nilai Siswa</h2>
        <div className='sm:col-start-3 sm:justify-self-end'>
          <Select value={`${year}`} onValueChange={changeYear}>
            <SelectTrigger className='w-full sm:w-52' aria-label='Pilih tahun'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((item) => (
                <SelectItem key={item} value={`${item}`}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {data.length ? (
        <div className='h-96 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 24, left: 8 }}
              barCategoryGap='20%'
            >
              <CartesianGrid vertical={false} stroke='var(--border)' />
              <XAxis
                dataKey='subjectName'
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval={0}
                tickFormatter={(value: string) =>
                  value.length > 16 ? `${value.slice(0, 15)}…` : value
                }
                label={{
                  value: 'Mata Diklat',
                  position: 'insideBottom',
                  offset: -16,
                  fontWeight: 600,
                }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'Rata-Rata Nilai Siswa',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontWeight: 600 },
                }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar
                dataKey='average'
                name='Rata-Rata Nilai'
                fill='var(--chart-bar)'
                radius={[4, 4, 0, 0]}
                maxBarSize={64}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='text-muted-foreground py-16 text-center'>
          Belum ada nilai siswa pada tahun {year}.
        </p>
      )}

      {data.length > 0 && (
        <details className='text-sm'>
          <summary className='text-muted-foreground cursor-pointer'>Lihat data tabel</summary>
          <table className='mt-2 w-full max-w-md text-left'>
            <thead>
              <tr className='border-b'>
                <th className='py-1 font-medium'>Mata Diklat</th>
                <th className='py-1 text-right font-medium'>Rata-Rata Nilai</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.subjectName} className='border-b last:border-0'>
                  <td className='py-1'>{item.subjectName}</td>
                  <td className='py-1 text-right tabular-nums'>{item.average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  )
}
