import { redirect, RedirectType } from 'next/navigation'
import { default as axios } from 'axios'
import { auth } from '@/lib/auth'
import { Routes } from '@/config'

export default async function LoginPage() {
  const currentSession = await auth()

  if (currentSession) {
    return redirect(Routes.Dashboard, RedirectType.replace)
  }

  // Ask our own /api/verify endpoint for the Keycloak authorization URL.
  // Kept outside the JSX branch below on purpose: `redirect()` throws to
  // signal Next.js, so it must never be called from inside this try block
  // or the catch here would swallow that signal instead of navigating.
  let ssoCallbackUrl: string | null = null

  try {
    const { data } = await axios.post<{ callbackUrl: string }>(
      process.env.KEYCLOAK_REDIRECT_URI + '/api/verify'
    )

    ssoCallbackUrl = data.callbackUrl
  } catch (error) {
    console.error('Failed to start SSO login flow:', error)
  }

  if (ssoCallbackUrl) {
    return redirect(ssoCallbackUrl, RedirectType.replace)
  }

  return (
    <main className='flex min-h-dvh flex-col items-center justify-center gap-2 p-6 text-center'>
      <h1 className='text-lg font-semibold'>Login SSO belum tersedia</h1>
      <p className='text-muted-foreground max-w-md text-sm'>
        Gagal memulai proses login. Pastikan konfigurasi Keycloak (KEYCLOAK_ID, KEYCLOAK_SECRET,
        KEYCLOAK_ISSUER, KEYCLOAK_REDIRECT_URI) sudah diisi dengan benar di environment.
      </p>
    </main>
  )
}
