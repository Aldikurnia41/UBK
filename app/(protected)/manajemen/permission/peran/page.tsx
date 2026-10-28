import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getRolesWithPaginate } from '@/feat/roles/api'
import { Roles } from '@/config'
import { default as RolesClient } from '@/app/(protected)/manajemen/permission/peran/client'

export default async function RolePage(props: ResponseNext<object, Pagination>) {
  const session = await auth()
  const { role } = await getPermissionAbility()

  if (!session || !role.canRead) {
    return notFound()
  }

  const searchParams = await props.searchParams
  const { data } = await getRolesWithPaginate(searchParams)

  return (
    <Container
      headline='PERAN & IZIN'
      breadcrumbs={{ items: [{ aliases: 'Peran & Izin' }] }}
      hideBackButton
    >
      <RolesClient
        {...data}
        canManage={role.canManage}
        isSuperadmin={session.roles.some((role) => role.name === Roles.Superadmin)}
      />
    </Container>
  )
}
