import type { Pagination } from '@sisfo-remake/ui/types'
import { uuid } from '@tanstack/react-form'

interface NotificationResponse {
  id: number
  data: {
    subject: string
    message: string
    url: string
  }
  userId: string
  institute: string
  app: string
  readAt: string | null
  createdAt: string
  updatedAt: string
}

interface Notification {
  id: string
  message: string
  author: string
  date: string
  isRead: boolean
}

interface NewNotification {
  app: 'ak' | 'al' | 'ubk' | 'sw'
  institute: string
  subject: string
  message: string
  url: string
  createdAt: string
}

const getAllNotificationDTO = ({
  data: notifications,
  author,
}: {
  data: Pagination<NotificationResponse[]>
  author?: string
}): Notification[] => {
  const { data } = notifications
  const newestNotification = data.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return newestNotification.map((notif) => ({
    id: `${notif.id}`,
    message: notif.data.message,
    author: author ?? '',
    date: notif.createdAt,
    isRead: !!notif.readAt,
  }))
}

const transformNotification = ({
  data,
  author,
}: {
  data: NewNotification
  author: string
}): Notification => {
  const { message, createdAt } = data
  return {
    id: uuid(),
    message,
    author,
    date: createdAt,
    isRead: false,
  }
}

export type { Notification, NotificationResponse, NewNotification }

export { getAllNotificationDTO, transformNotification }
