import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { RoleClient } from '@/feat/roles/components/role-client'
import { getRoleById } from '@/feat/roles/api'
import { Roles, Routes } from '@/config'

export default async function RolesEditPage({ params }: ResponseNext<{ roleId: string }>) {
  const session = await auth()
  const { role } = await getPermissionAbility()

  if (!session || !role.canManage || !role.canRead) {
    return notFound()
  }
  const { roleId } = await params
  const { data: roleObj } = await getRoleById(roleId)
  const isSuperadmin = session.roles.some((role) => role.name === Roles.Superadmin)

  // You are not superadmin and try to edit superadmin.
  if (!roleObj || (!isSuperadmin && roleObj.name === Roles.Superadmin)) {
    return notFound()
  }

  return (
    <Container
      headline='EDIT'
      breadcrumbs={{
        items: [{ path: Routes.Roles, aliases: 'Peran & Izin' }, { aliases: 'Edit' }],
      }}
    >
      <RoleClient role={roleObj} />
    </Container>
  )
}
