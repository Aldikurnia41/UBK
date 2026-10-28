import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { UsersResponseDTO } from '@/feat/access/dto'
import { useState } from 'react'
import { toast, Button, ButtonGroup, ButtonLink, Modal, Icon } from '@sisfo-remake/ui'
import { deleteAccess } from '@/feat/access/api'
import { Roles, Routes } from '@/config'

const AccessAction: React.FC<{
  row: CellContext<UsersResponseDTO, unknown>['row']
  ssoId: string
  isSuperadmin: boolean
  canManage: boolean
}> = ({ row, canManage, ssoId, isSuperadmin }) => {
  const [open, onOpenChange] = useState(false)
  const { role, ...user } = row.original

  // NOTE:
  // 1. Superadmin account couldn't edit another superadmin
  // 2. Superadmin account couldn't delete their self
  const others = user.ssoId !== ssoId
  const canEdit = isSuperadmin || user.ssoId === ssoId || role !== Roles.Superadmin
  const canDelete = isSuperadmin ? others : others && role !== Roles.Superadmin

  return (
    <ButtonGroup>
      <ButtonLink size='icon' variant='outline' href={`${Routes.Access}/${user.ssoId}`}>
        <Icon type='Ikon Detail' />
      </ButtonLink>
      {canManage && (
        <>
          {canEdit && (
            <ButtonLink size='icon' variant='outline' href={`${Routes.Access}/${user.ssoId}/edit`}>
              <Icon type='Ikon Edit' />
            </ButtonLink>
          )}
          {canDelete && (
            <Modal
              trigger={{ asChild: true }}
              root={{ open, onOpenChange }}
              title={{ children: 'HAPUS DATA?' }}
              description={{
                children: 'Anda akan menghapus data ini secara permanen',
              }}
              cancel={{ children: 'Batal' }}
              submit={{
                children: 'Hapus',
                onClick: async () => {
                  const { error } = await deleteAccess(row.original.ssoId)

                  if (error) {
                    return toast.error(error.message)
                  }

                  toast.success(`Data berhasil dihapus`)
                  onOpenChange(false)
                },
              }}
            >
              <Button size='icon' variant='outline'>
                <Icon type='Ikon Hapus' />
              </Button>
            </Modal>
          )}
        </>
      )}
    </ButtonGroup>
  )
}

const AccessEmail: React.FC<CellContext<UsersResponseDTO, unknown>> = ({ row }) => {
  return row.original.email ?? '-'
}

export const accessColumn = ({
  ssoId,
  isSuperadmin,
  canManage,
}: {
  ssoId: string
  isSuperadmin: boolean
  canManage: boolean
}): ColumnDef<UsersResponseDTO>[] => [
  {
    accessorKey: 'fullname',
    header: () => 'Nama Lengkap',
    size: 375,
  },
  {
    accessorKey: 'username',
    header: () => 'Nama Pengguna',
    size: 375,
  },
  {
    accessorKey: 'email',
    header: () => 'Email',
    cell: AccessEmail,
    size: 375,
  },
  {
    accessorKey: 'role',
    header: () => 'Peran',
    size: 375,
  },
  {
    accessorKey: 'action',
    header: () => 'Aksi',
    size: 150,
    cell: ({ row }) => <AccessAction {...{ row, ssoId, isSuperadmin, canManage }} />,
  },
]
