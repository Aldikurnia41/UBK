import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { RolesDTO } from '@/feat/roles/dto'
import { useState } from 'react'
import { toast, Button, ButtonGroup, ButtonLink, Modal, Icon } from '@sisfo-remake/ui'
import { deleteRoles } from '@/feat/roles/api'
import { Roles, Routes } from '@/config'

const RolesAction: React.FC<{
  row: CellContext<RolesDTO, unknown>['row']
  canManage: boolean
  isSuperadmin: boolean
}> = ({ row, canManage, isSuperadmin }) => {
  const [open, onOpenChange] = useState(false)
  const canEdit = isSuperadmin || row.original.name !== Roles.Superadmin

  return (
    <ButtonGroup>
      <ButtonLink size='icon' variant='outline' href={`${Routes.Roles}/${row.original.id}`}>
        <Icon type='Ikon Detail' />
      </ButtonLink>
      {canManage && (
        <>
          {canEdit && (
            <ButtonLink
              size='icon'
              variant='outline'
              href={`${Routes.Roles}/${row.original.id}/edit`}
            >
              <Icon type='Ikon Edit' />
            </ButtonLink>
          )}
          {!Object.values(Roles).includes(row.original.name) && (
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
                  const { error } = await deleteRoles(row.original.id)

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

export const rolesColumn = ({
  isSuperadmin,
  canManage,
}: {
  isSuperadmin: boolean
  canManage: boolean
}): ColumnDef<RolesDTO>[] => [
  {
    accessorKey: 'name',
    header: () => 'Peran',
    size: 275,
  },
  {
    accessorKey: 'action',
    header: () => 'Aksi',
    size: 150,
    cell: ({ row }) => <RolesAction {...{ row, isSuperadmin, canManage }} />,
  },
]
