import type { ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { RoleClient } from '@/feat/roles/components/role-client'
import { getRoleById } from '@/feat/roles/api'
import { Routes } from '@/config'

export default async function RolesDetailPage({ params }: ResponseNext<{ roleId: string }>) {
  const { role } = await getPermissionAbility()

  if (!role.canRead) {
    return notFound()
  }
  const { roleId } = await params
  const { data: roleObj } = await getRoleById(roleId)

  if (!roleObj) {
    return notFound()
  }

  return (
    <Container
      headline='DETAIL'
      breadcrumbs={{
        items: [{ path: Routes.Roles, aliases: 'Peran & Izin' }, { aliases: 'Detail' }],
      }}
    >
      <RoleClient readonly role={roleObj} />
    </Container>
  )
}
