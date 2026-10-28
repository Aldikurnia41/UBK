import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getRoles } from '@/feat/roles/api'
import { AccessClient } from '@/feat/access/components/access-client'
import { getUsersById } from '@/feat/access/api'
import { Roles, Routes } from '@/config'

export default async function AccessEditPage({
  params,
  searchParams,
}: ResponseNext<{ userId: string }, Pagination>) {
  const session = await auth()
  const { access } = await getPermissionAbility()

  if (!session || !access.canManage || !access.canRead) {
    return notFound()
  }

  const isSuperadmin = session.roles.some((role) => role.name === Roles.Superadmin)
  const resolvedSearchParams = await searchParams
  const { userId } = await params
  const [{ data: user }, { data: roles }] = await Promise.all([
    getUsersById(userId),
    getRoles(resolvedSearchParams),
  ])

  // You are not superadmin and try to edit superadmin.
  if (!user || (!isSuperadmin && user.role === Roles.Superadmin)) {
    return notFound()
  }

  return (
    <Container
      headline='EDIT'
      breadcrumbs={{
        items: [{ path: Routes.Access, aliases: 'Akses' }, { aliases: 'Edit' }],
      }}
    >
      <AccessClient
        user={user}
        roles={roles.filter(({ name }) => name !== Roles.Siswa)}
        isSuperadmin={isSuperadmin}
      />
    </Container>
  )
}
