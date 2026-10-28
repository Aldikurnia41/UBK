'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { RolesDTO } from '@/feat/roles/dto'
import { ButtonLink, Icon, TableView } from '@sisfo-remake/ui'
import { Routes } from '@/config'
import { rolesColumn } from '@/columns/roles'

interface RoleProps extends Pagination<RolesDTO[]> {
  isSuperadmin: boolean
  canManage: boolean
}

export default function RolesClient({
  data: roles,
  canManage,
  isSuperadmin,
  ...pagination
}: RoleProps) {
  return (
    <TableView
      data={roles}
      columns={rolesColumn({ canManage, isSuperadmin })}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Peran' }}
      insertBefore={
        canManage && (
          <ButtonLink href={Routes.Roles + '/tambah'}>
            <Icon type='Ikon Tambah' />
            Tambah
          </ButtonLink>
        )
      }
    />
  )
}
