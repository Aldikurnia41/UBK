import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getRoles } from '@/feat/roles/api'
import { getUsers } from '@/feat/access/api'
import { Roles } from '@/config'
import { default as AccessClient } from '@/app/(protected)/manajemen/permission/akses/client'

export default async function AccessPage(props: ResponseNext<object, Pagination>) {
  const searchParams = await props.searchParams
  const [{ data: users }, { data: roles }] = await Promise.all([getUsers(searchParams), getRoles()])
  const session = await auth()
  const { access } = await getPermissionAbility()

  if (!session || !access.canRead) {
    return notFound()
  }

  return (
    <Container headline='Akses' breadcrumbs={{ items: [{ aliases: 'Akses' }] }} hideBackButton>
      <AccessClient
        {...users}
        roles={roles}
        canManage={access.canManage}
        ssoId={session.profile.ssoId}
        isSuperadmin={session.roles.some((role) => role.name === Roles.Superadmin)}
      />
    </Container>
  )
}
