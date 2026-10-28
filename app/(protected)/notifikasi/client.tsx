'use client'

import type { Notification } from '@/feat/notification/dto'
import { cn, djs } from '@/lib/utils'

const MessageBox: React.FC<Notification> = (props) => {
  const { author, date, message, isRead } = props

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-1 rounded border-[0.5px] border-slate-300 p-2 hover:cursor-default',
        !isRead && 'bg-gray-200/50'
      )}
    >
      <div className='flex w-full flex-col flex-wrap justify-between gap-1 @xl/container-content:flex-row'>
        <span className='font-semibold wrap-anywhere'>{author}</span>
        <span className='wrap-anywhere text-slate-500'>
          {djs(date).format('D MMMM YYYY [pukul] HH:mm')}
        </span>
      </div>
      <div className='wrap-anywhere text-slate-500'>{message}</div>
    </div>
  )
}

export default function NotificationClient({ notifications }: { notifications: Notification[] }) {
  return (
    <div className='space-y-3'>
      {notifications.map((notif) => (
        <MessageBox key={notif.id} {...notif} />
      ))}
    </div>
  )
}
