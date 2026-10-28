'use client'

import type { StudentTestSchedule } from '@/feat/test/dto'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { Button, FormField, Modal, toast } from '@sisfo-remake/ui'
import { yup } from '@/lib/utils'
import { requiredString } from '@/lib/helpers'
import { Routes } from '@/config'

function TokenForm({
  schedule,
  onCancel,
}: {
  schedule: StudentTestSchedule
  onCancel: () => void
}) {
  const router = useRouter()
  const form = useForm({
    defaultValues: { token: '' },
    validators: { onSubmitAsync: yup.object({ token: requiredString(6, 6) }) },
    onSubmit: ({ value }) => {
      if (value.token.trim() !== schedule.token) {
        return toast.error('Token salah')
      }
      router.push(`${Routes.Test}/${schedule.id}`)
    },
  })

  return (
    <FormField
      form={form}
      submit={{ children: 'Masuk' }}
      cancel={{
        requireConfirm: false,
        children: 'Batal',
        onClick: () => {
          form.reset()
          onCancel()
        },
      }}
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      groups={[
        {
          column: 1,
          fields: [{ label: '', name: 'token', type: 'text', placeholder: 'Masukkan Token' }],
        },
      ]}
    />
  )
}

/** Tombol "Kerjakan Tes" + modal "Masukkan Token" */
export function StartTestButton({ schedule }: { schedule: StudentTestSchedule }) {
  const [open, setOpen] = useState(false)

  if (!schedule.canStart) {
    return (
      <Button variant='secondary' disabled>
        {schedule.isDone ? 'Sudah Dikerjakan' : 'Kerjakan Tes'}
      </Button>
    )
  }

  return (
    <Modal
      trigger={{ asChild: true }}
      root={{ open, onOpenChange: setOpen, modal: false }}
      title={{ children: 'Masukkan Token' }}
      description={{ children: <TokenForm schedule={schedule} onCancel={() => setOpen(false)} /> }}
      centerIcon={{ children: <Play fill='#fff' /> }}
      cancel={{ hidden: true }}
      submit={{ hidden: true }}
    >
      <Button variant='default'>Kerjakan Tes</Button>
    </Modal>
  )
}
