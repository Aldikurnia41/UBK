'use server'

import type { AxiosRequestConfig } from 'axios'
import type { RefreshTokenResponseDTO, ProfileMeResponseDTO, Account } from '@/feat/auth/dto'
import { default as axios } from 'axios'
import { createResponseError, createResponseSuccess } from '@sisfo-remake/ui/utils'
import { auth, signIn, signOut } from '@/lib/auth'
import { createAuthHeaders } from '@/feat/auth/helpers'
import { RoutesApi, SSOConfig } from '@/config'

// API Endpoints
const APP_API_RBAC = process.env.APP_API_RBAC ?? ''
const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER ?? ''
const KEYCLOAK_PROFILE = process.env.KEYCLOAK_PROFILE ?? ''
const KEYCLOAK_ID = SSOConfig.KeycloakId
const KEYCLOAK_SECRET = SSOConfig.KeycloakSecret

/**
 * Refresh the access token using the refresh token
 */
export async function refreshToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_ID,
    client_secret: KEYCLOAK_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  try {
    return await axios.post<RefreshTokenResponseDTO>(
      [KEYCLOAK_ISSUER, RoutesApi.KeycloakToken].join(''),
      params,
      config
    )
  } catch (error) {
    console.error('Failed to refresh token:', error)
    throw new Error('Token refresh failed')
  }
}

/**
 * Get the current user's profile information
 */
export async function getUserProfile(accessToken: string) {
  const config: AxiosRequestConfig = {
    headers: createAuthHeaders(accessToken),
  }

  try {
    return await axios.get<ProfileMeResponseDTO>(
      [KEYCLOAK_PROFILE, RoutesApi.AuthProfile].join(''),
      config
    )
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    throw new Error('Failed to fetch user profile')
  }
}

/**
 * Get roles and permissions for the current user
 */
export async function getRolesWithPermissions(accessToken: string, ssoId: string) {
  const config: AxiosRequestConfig = {
    params: {
      appType: SSOConfig.AppType,
    },
    headers: createAuthHeaders(accessToken),
  }

  try {
    const response = await axios.get<Account>(`${APP_API_RBAC}/users/${ssoId}`, config)
    const roles = response.data.roles.map(({ id, name, appType }) => ({
      id,
      name,
      appType,
    }))

    const permissions = response.data.roles.flatMap((role) =>
      role.permissions.map(({ id, name, appType }) => ({
        id,
        name,
        appType,
      }))
    )

    return { roles, permissions }
  } catch (error) {
    console.error('Failed to fetch roles and permissions:', error)
    throw new Error('Failed to fetch roles and permissions')
  }
}

/**
 * Remove session on the server and clean cookie session
 */
export async function logoutSession() {
  const API_LOGOUT = [process.env.KEYCLOAK_ISSUER, RoutesApi.KeycloakLogout].join('')
  const KEYCLOAK_ID = SSOConfig.KeycloakId
  const KEYCLOAK_SECRET = SSOConfig.KeycloakSecret

  try {
    const session = await auth()
    const params = new URLSearchParams({
      client_id: KEYCLOAK_ID,
      client_secret: KEYCLOAK_SECRET,
      refresh_token: session?.refresh_token ?? '',
    })

    await signOut({ redirect: false })
    await axios.post<void>(API_LOGOUT, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return createResponseSuccess(null)
  } catch (e) {
    return createResponseError(e, null)
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export async function createSession(callbackUrl: string) {
  try {
    const redirectUrl: string = await signIn(
      'keycloak',
      { redirect: false },
      callbackUrl ? { callbackUrl } : void 0
    )

    return createResponseSuccess(redirectUrl)
  } catch (error) {
    return createResponseError(error, '')
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
