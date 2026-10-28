import { cn } from '@/lib/utils'

export interface InfoItem {
  label: string
  value: React.ReactNode
  hide?: boolean
}

/**
 * Label–value list used by the detail headers (Detail Jadwal, Daftar Siswa, Nilai).
 * `columns={2}` renders the two-column layout from the Belneg design.
 */
export function InfoList({
  items,
  columns = 1,
  className,
}: {
  items: InfoItem[]
  columns?: 1 | 2
  className?: string
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-4',
        columns === 2 && 'md:grid-cols-2',
        className
      )}
    >
      {items
        .filter((item) => !item.hide)
        .map((item) => (
          <div
            key={item.label}
            className='grid grid-cols-[minmax(0,12.5rem)_1fr] items-start gap-4'
          >
            <dt className='font-bold'>{item.label}</dt>
            <dd className='text-foreground/80 break-words'>
              {item.value === '' ? '-' : (item.value ?? '-')}
            </dd>
          </div>
        ))}
    </dl>
  )
}
