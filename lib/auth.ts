import type { NextAuthConfig, DefaultSession } from 'next-auth'
import type { AuthDTO } from '@/feat/auth/dto'
import { default as KeycloakProvider } from 'next-auth/providers/keycloak'
import { default as NextAuth } from 'next-auth'
import {
  fetchUserProfile,
  isTokenExpired,
  refreshAccessToken,
  shouldRefreshPermissions,
  updatePermissions,
} from '@/feat/auth/helpers'
import { RoutesApi, SSOConfig } from '@/config'

declare module 'next-auth' {
  interface Session extends AuthDTO {
    user: DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends AuthDTO {
    idToken?: string
  }
}

// Constants
const AUTH_SECRET = process.env.AUTH_SECRET ?? ''
const KEYCLOAK_ID = SSOConfig.KeycloakId
const KEYCLOAK_SECRET = SSOConfig.KeycloakSecret
const KEYCLOAK_ISSUER = SSOConfig.KeycloakIssuer
const SESSION_MAX_AGE = 6 * 60 * 60 // 6 hours in seconds

const AuthOptions: NextAuthConfig = {
  secret: AUTH_SECRET,
  session: {
    maxAge: SESSION_MAX_AGE,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
  providers: [
    // NextAuth validates every registered provider's config on each call
    // (assertConfig); only register Keycloak once its config is present.
    ...(KEYCLOAK_ISSUER && KEYCLOAK_ID && KEYCLOAK_SECRET
      ? [
          KeycloakProvider({
            clientId: KEYCLOAK_ID,
            clientSecret: KEYCLOAK_SECRET,
            checks: ['none'],
            issuer: KEYCLOAK_ISSUER,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Save account information on initial sign-in
      if (account) {
        token.access_token = account.access_token ?? ''
        token.expires_at = account.expires_at ?? 0
        token.refresh_token = account.refresh_token ?? ''
      }

      // Fetch profile on first request
      if (!token.profile) {
        token.profile = await fetchUserProfile(token.access_token)
      } else {
        try {
          const { default: axios } = await import('axios')
          const { data } = await axios.post<{ active: boolean }>(
            [KEYCLOAK_ISSUER, RoutesApi.KeycloakToken, '/introspect'].join(''),
            {
              client_id: KEYCLOAK_ID,
              client_secret: KEYCLOAK_SECRET,
              token: token.access_token,
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )

          if (!data.active) return null
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return null
        }
      }

      // Refresh permissions
      if (shouldRefreshPermissions(token)) {
        await updatePermissions(token)
      }

      // Return token it its still valid and got no error
      if (!isTokenExpired(token) && token?.error !== 'RefreshAccessTokenError') {
        return token
      }

      // Otherwise refresh access token
      return await refreshAccessToken(token)
    },

    session({ session, token }) {
      session.access_token = token.access_token
      session.refresh_token = token.refresh_token
      session.profile = token.profile
      session.active_instance = token.active_instance
      session.roles = token.roles
      session.permissions = token.permissions
      session.expired_permissions = token.expired_permissions

      return session
    },

    redirect({ baseUrl }) {
      return baseUrl
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(AuthOptions)
