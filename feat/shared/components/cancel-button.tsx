'use client'

import { useState } from 'react'
import { Button, ModalCancel } from '@sisfo-remake/ui'

/** "Batal" (outline merah sesuai desain Belneg) dengan konfirmasi pembatalan perubahan */
export function CancelButton({
  onConfirm,
  children = 'Batal',
}: {
  onConfirm: () => void
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <ModalCancel
      root={{ open, onOpenChange: setOpen }}
      trigger={{ asChild: true }}
      submit={{
        onClick: () => {
          setOpen(false)
          onConfirm()
        },
      }}
    >
      <Button type='button' variant='outline-destructive'>
        {children}
      </Button>
    </ModalCancel>
  )
}
