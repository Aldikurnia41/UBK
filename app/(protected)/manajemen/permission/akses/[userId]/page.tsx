import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getRoles } from '@/feat/roles/api'
import { AccessClient } from '@/feat/access/components/access-client'
import { getUsersById } from '@/feat/access/api'
import { Roles, Routes } from '@/config'

export default async function AccessDetailPage({
  params,
  searchParams,
}: ResponseNext<{ userId: string }, Pagination>) {
  const { userId } = await params
  const session = await auth()
  const { access } = await getPermissionAbility()

  if (!session || !access.canRead) {
    return notFound()
  }

  const resolvedSearchParams = await searchParams
  const [{ data: user }, { data: roles }] = await Promise.all([
    getUsersById(userId),
    getRoles(resolvedSearchParams),
  ])

  if (!user) {
    return notFound()
  }

  return (
    <Container
      headline='DETAIL'
      breadcrumbs={{
        items: [{ path: Routes.Access, aliases: 'Akses' }, { aliases: 'Detail' }],
      }}
    >
      <AccessClient
        isSuperadmin={session.roles.some((role) => role.name === Roles.Superadmin)}
        readonly
        user={user}
        roles={roles}
      />
    </Container>
  )
}
