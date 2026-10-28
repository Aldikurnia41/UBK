import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { PureAbility } from '@casl/ability'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { getAllNotification, readAll } from '@/feat/notification/api'
import { default as NotificationClient } from '@/app/(protected)/notifikasi/client'

export default async function NotificationPage() {
  const session = await auth()
  const ability = new PureAbility(session?.permissions)
  const canReadNotif = ability.can('lihat', 'notifikasi_sendiri')
  const canManageNotif = ability.can('mengelola', 'notifikasi_sendiri')

  if (!canReadNotif) {
    return notFound()
  }

  const [, { data: notifications }] = await Promise.all([
    canManageNotif ? readAll() : Promise.resolve(null),
    getAllNotification(),
  ])
  return (
    <Container
      headline='DAFTAR NOTIFIKASI'
      breadcrumbs={{ items: [{ aliases: 'Daftar Notifikasi' }] }}
      contentProps={{
        className: cn(!notifications.length && 'bg-transparent text-center p-0!'),
      }}
    >
      {!notifications.length ? (
        <div className='flex h-[calc(100vh-205px)] items-center justify-center text-lg font-bold text-neutral-900 md:h-[calc(100vh-176px)]'>
          Data Kosong
        </div>
      ) : (
        <NotificationClient {...{ notifications }} />
      )}
    </Container>
  )
}
