import type { JWT } from 'next-auth/jwt'
import type { AuthDTO, CASLRules, Permission } from '@/feat/auth/dto'
import { djs } from '@/lib/utils'
import { getRolesWithPermissions, getUserProfile, refreshToken } from '@/feat/auth/api'
import { SSOConfig } from '@/config'

const REFRESH_TOKEN_BUFFER = 60 // Refresh 60 seconds before expiry

// Permissions parser utility to CASL rules https://casl.js.org/v6/en/guide/define-rules
export function caslSchemaBuilder(arr: Pick<Permission, 'name'>[]): CASLRules[] {
  const result = arr.reduce<Record<string, CASLRules>>((store, item) => {
    const [canAction, ...arrSubject] = item.name.split('_') // "can-lihat", ["lihat", "daftar", "profile"]
    const action = canAction?.split('-')?.[1] // menghapus "can-" menjadi "lihat"
    const subject = arrSubject.join('_') // "lihat_daftar_profile"

    store[canAction] ??= {
      action,
      subject: [],
    }

    store[canAction].subject = [...store[canAction].subject, subject]

    return store
  }, {})

  return Object.values(result)
}

export function getAvatarFallbackInitials(name?: string) {
  if (!name) return ''

  const trimmedName = name.trim()
  const nameParts = trimmedName
    .split(' ')
    .map((item) => item.replace(/[^a-zA-Z]/g, ''))
    .filter(Boolean)

  if (nameParts.length > 1) {
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
  }

  return nameParts[0].substring(0, 2).toUpperCase()
}

/**
 * Fetch and format user profile
 */
export async function fetchUserProfile(accessToken: string): Promise<AuthDTO['profile']> {
  const { data: user } = await getUserProfile(accessToken)

  return {
    id: user.id,
    ssoId: user.ssoId,
    instance: user.instance,
    fullName: user.profile.fullName,
    typeAcc: user.profile.typeAcc,
    studentStatus: user.profile.studentStatus,
    acc: {
      instansi: user.acc?.instansi,
      pre_role: user.acc?.pre_role,
      meta_properties: user.acc?.meta_properties,
    },
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await refreshToken(token.refresh_token)

    if (response.status !== 200) {
      throw new Error('Token refresh failed')
    }

    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data

    return {
      ...token,
      access_token,
      access_token_expired: Date.now() + expires_in * 1000,
      refresh_token: new_refresh_token ?? token.refresh_token,
      error: null,
    }
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpired(token: JWT): boolean {
  if (!token.expires_at) return true

  const currentTime = Math.floor(Date.now() / 1000)
  const expiryTime = token.expires_at

  return currentTime >= expiryTime - REFRESH_TOKEN_BUFFER
}

/**
 * Check if permissions need refresh
 */
export function shouldRefreshPermissions(token: JWT): boolean {
  const hasRolesAndPermissions = !!token.roles && !!token.permissions
  const isCorrectInstance = token.active_instance === SSOConfig.AppType
  const isNotExpired = djs().unix() < djs(token?.expired_permissions).unix()

  return !hasRolesAndPermissions || !isCorrectInstance || !isNotExpired
}

/**
 * Fetch and update permissions
 */
export async function updatePermissions(token: JWT): Promise<void> {
  const { roles, permissions } = await getRolesWithPermissions(
    token.access_token,
    token.profile.ssoId
  )

  token.active_instance = SSOConfig.AppType
  token.roles = roles
  token.permissions = caslSchemaBuilder(permissions)
  token.expired_permissions = djs().add(+SSOConfig.ExpiredPermission, 'seconds').toISOString()
}

/**
 * Create authorization headers
 */
export function createAuthHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'institute-selected': SSOConfig.InstituteSelected,
  }
}
