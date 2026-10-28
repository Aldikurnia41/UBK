'use client'

import type { Pagination } from '@sisfo-remake/ui/types'
import type { RolesDTO } from '@/feat/roles/dto'
import type { UsersResponseDTO } from '@/feat/access/dto'
import { ButtonLink, Icon, TableView } from '@sisfo-remake/ui'
import { Roles, Routes } from '@/config'
import { accessColumn } from '@/columns/access'

interface AccessProps extends Pagination<UsersResponseDTO[]> {
  roles: RolesDTO[]
  canManage: boolean
  ssoId: string
  isSuperadmin: boolean
}
export default function AccessClient({
  data: users,
  roles,
  canManage,
  ssoId,
  isSuperadmin,
  ...pagination
}: AccessProps) {
  return (
    <TableView
      data={users}
      columns={accessColumn({ ssoId, isSuperadmin, canManage })}
      pagination={{ searchParams: pagination }}
      search={{ placeholder: 'Cari Nama' }}
      insertBefore={
        canManage && (
          <ButtonLink href={Routes.Access + '/tambah'}>
            <Icon type='Ikon Tambah' />
            Tambah
          </ButtonLink>
        )
      }
      filter={{
        groups: [
          {
            combobox: { commandInput: { placeholder: 'Cari Peran...' } },
            placeholder: {
              select: 'Pilih Peran',
            },
            key: 'roles.name',
            title: 'Peran',
            items: roles
              .filter(({ name }) => name !== Roles.Siswa)
              .map(({ name }) => ({
                value: name,
                label: name,
              })),
          },
        ],
      }}
    />
  )
}
