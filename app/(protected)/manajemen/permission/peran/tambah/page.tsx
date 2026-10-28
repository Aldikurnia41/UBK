import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { RoleClient } from '@/feat/roles/components/role-client'
import { getPermissions } from '@/feat/roles/api'
import { Routes } from '@/config'

export default async function RolesCreatePage() {
  const { role } = await getPermissionAbility()

  if (!role.canManage || !role.canRead) {
    return notFound()
  }
  const { data: permissions } = await getPermissions()
  const roleObj = {
    id: '',
    name: '',
    role: '',
    permissions: [],
    allPermission: permissions,
  }

  return (
    <Container
      headline='TAMBAH'
      breadcrumbs={{
        items: [{ path: Routes.Roles, aliases: 'Peran & Izin' }, { aliases: 'Tambah' }],
      }}
    >
      <RoleClient role={roleObj} />
    </Container>
  )
}
