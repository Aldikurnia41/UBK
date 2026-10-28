import type { Pagination, ResponseNext } from '@sisfo-remake/ui/types'
import { notFound } from 'next/navigation'
import { Container } from '@sisfo-remake/ui'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getRoles } from '@/feat/roles/api'
import { AccessClient } from '@/feat/access/components/access-client'
import { Roles, Routes } from '@/config'

export default async function AccessCreatePage({ searchParams }: ResponseNext<object, Pagination>) {
  const resolvedSearchParams = await searchParams
  const { data: roles } = await getRoles(resolvedSearchParams)
  const session = await auth()
  const { access } = await getPermissionAbility()

  if (!session || !access.canManage) {
    return notFound()
  }

  return (
    <Container
      headline='TAMBAH'
      breadcrumbs={{
        items: [{ path: Routes.Access, aliases: 'Akses' }, { aliases: 'Tambah' }],
      }}
    >
      <AccessClient
        roles={roles.filter(({ name }) => name !== Roles.Siswa)}
        isSuperadmin={session.roles.some((role) => role.name === Roles.Superadmin)}
        user={{
          ssoId: '',
          fullname: '',
          role: '',
          profile: {
            typeAcc: '',
            positions: [],
            certificates: [],
          },
          username: '',
          email: '',
        }}
      />
    </Container>
  )
}
