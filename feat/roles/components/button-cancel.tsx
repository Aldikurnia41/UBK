import { useState } from 'react'
import { Button, Modal } from '@sisfo-remake/ui'

export function ButtonCancel({ submit }: { submit: () => void }) {
  const [open, onOpenChange] = useState(false)
  return (
    <Modal
      trigger={{ asChild: true }}
      root={{ open, onOpenChange }}
      title={{ children: 'Konfirmasi Pembatalan' }}
      description={{
        children: 'Apakah Anda yakin ingin membatalkan perubahan pada form ini?',
      }}
      cancel={{
        children: 'Tutup',
      }}
      submit={{
        children: 'Batalkan Perubahan',
        onClick: () => {
          submit()
          onOpenChange(false)
        },
      }}
    >
      <Button onClick={() => onOpenChange(true)} variant='outline'>
        Batal
      </Button>
    </Modal>
  )
}
