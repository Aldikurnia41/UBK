'use server'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { UpdateUserPayload, UsersResponseDTO } from '@/feat/access/dto'
import { refresh } from 'next/cache'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiProfile } from '@/lib/axios'
import { RoutesApi, SSOConfig } from '@/config'

export const getUsers = async (searchParams: Pagination) => {
  try {
    const { data: allUsers } = await apiProfile.get<Pagination<UsersResponseDTO[]>>(
      `${RoutesApi.Access}`,
      {
        params: {
          ...searchParams,
          ['roles.appType']: SSOConfig.AppType,
          notStudent: true,
          sort: 'createdAt',
          sortType: 'DESC',
        },
      }
    )
    return createResponseSuccess(allUsers)
  } catch (error) {
    return createResponseError<Pagination<UsersResponseDTO[]>>(error)
  }
}

export const getUsersById = async (ssoId: string) => {
  try {
    const { data: user } = await apiProfile.get<UsersResponseDTO>(`${RoutesApi.Access}/${ssoId}`, {
      params: {
        ['roles.appType']: SSOConfig.AppType,
      },
    })

    return createResponseSuccess(user)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const updateUser = async (ssoId: string, payload: UpdateUserPayload) => {
  try {
    await apiProfile.put<UpdateUserPayload>(`${RoutesApi.Access}/${ssoId}`, payload)
    await new Promise((res) => setTimeout(res, 3_000))

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const createUser = async (payload: UpdateUserPayload) => {
  try {
    await apiProfile.post<UpdateUserPayload>(`${RoutesApi.Access}`, payload)
    await new Promise((res) => setTimeout(res, 3_000))

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const uploadCertificate = async (files: File[]) => {
  try {
    const formData = new FormData()
    files.map((file) => formData.append('certificates', file))
    // TODO: GANTI OBJECT TO BE URL, PATH
    const { data } = await apiProfile.post<{ url: string; path: string }[]>(
      `${RoutesApi.Access}/certificates`,
      formData
    )
    return createResponseSuccess(data)
  } catch (error) {
    return createResponseError(error, [])
  }
}

export const deleteAccess = async (id: string) => {
  try {
    await apiProfile.delete<{ id: string }>(`${RoutesApi.Access}/${id}`, {
      params: {
        ['roles.appType']: SSOConfig.AppType,
      },
    })

    await new Promise((res) => setTimeout(res, 3_000))

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}
