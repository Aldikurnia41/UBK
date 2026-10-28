'use server'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { Notification, NotificationResponse } from '@/feat/notification/dto'
import { createResponseError, createResponseSuccess, qstring } from '@sisfo-remake/ui/utils'
import { apiNotification } from '@/lib/axios'
import { auth } from '@/lib/auth'
import { getAllNotificationDTO } from '@/feat/notification/dto'
import { RoutesApi, SSOConfig } from '@/config'

export const getAllNotification = async () => {
  try {
    const session = await auth()
    const { data } = await apiNotification.get<Pagination<NotificationResponse[]>>(
      qstring(RoutesApi.Notifications, {
        page: 1,
        limit: 100000,
        institute: SSOConfig.InstituteSelected,
        app: 'ak',
      })
    )
    return createResponseSuccess(getAllNotificationDTO({ data, author: session?.profile.fullName }))
  } catch (error) {
    return createResponseError<Notification[]>(error, [])
  }
}

export const readAll = async () => {
  try {
    const { data } = await apiNotification.post<{ message: string }>(
      `${RoutesApi.Notifications}/read-all`,
      null
    )
    return createResponseSuccess(data)
  } catch (error) {
    return createResponseError<{ message: string }>(error)
  }
}
