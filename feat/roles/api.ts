'use server'

import type { Pagination } from '@sisfo-remake/ui/types'
import type {
  PermissionResponseDTO,
  RolesDTO,
  RolesResponseDTO,
  RolesPayloadDTO,
} from '@/feat/roles/dto'
import { refresh } from 'next/cache'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { apiRBAC } from '@/lib/axios'
import { RoutesApi, SSOConfig } from '@/config'

export const getRolesWithPaginate = async (searchParams: Pagination) => {
  try {
    const { data: allRoles } = await apiRBAC.get<Pagination<RolesDTO[]>>(
      `${RoutesApi.Roles}/paginate`,
      {
        params: {
          ...searchParams,
          appType: SSOConfig.AppType,
          sort: 'createdAt',
          sortType: 'DESC',
        },
      }
    )
    return createResponseSuccess(allRoles)
  } catch (error) {
    return createResponseError<Pagination<RolesDTO[]>>(error)
  }
}

export const getRoles = async (searchParams = {}): Promise<Pagination<RolesDTO[]>> => {
  try {
    const { data: allRoles } = await apiRBAC.get<RolesDTO[]>(`${RoutesApi.Roles}`, {
      params: {
        ...searchParams,
        appType: SSOConfig.AppType,
      },
    })
    return createResponseSuccess(allRoles)
  } catch (error) {
    return createResponseError(error, [])
  }
}

export const getRoleById = async (id: string) => {
  try {
    const { data: role } = await apiRBAC.get<RolesResponseDTO>(`${RoutesApi.Roles}/${id}`, {
      params: {
        appType: SSOConfig.AppType,
      },
    })

    return createResponseSuccess(role)
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const updateRoles = async (id: string, payload: Omit<RolesPayloadDTO, 'appType'>) => {
  try {
    await apiRBAC.put<RolesPayloadDTO>(`${RoutesApi.Roles}/${id}`, {
      ...payload,
      appType: SSOConfig.AppType,
    })

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const createRoles = async (payload: Omit<RolesPayloadDTO, 'appType'>) => {
  try {
    await apiRBAC.post(`${RoutesApi.Roles}`, {
      ...payload,
      appType: SSOConfig.AppType,
    })

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const deleteRoles = async (id: string) => {
  try {
    await apiRBAC.delete<{ id: string }>(`${RoutesApi.Roles}/${id}`)

    refresh()
    return createResponseSuccess({ message: 'Success' })
  } catch (error) {
    return createResponseError(error, null)
  }
}

export const getPermissions = async () => {
  try {
    const { data: permissions } = await apiRBAC.get<PermissionResponseDTO[]>(
      `${RoutesApi.Permissions}`,
      {
        params: {
          appType: SSOConfig.AppType,
        },
      }
    )
    return createResponseSuccess(permissions)
  } catch (error) {
    return createResponseError(error, [])
  }
}
