import type { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/dist/client/components/navigation'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@sisfo-remake/ui'
import { POPUP_ATTRIBUTE } from '@/feat/test/constant'
import { Routes } from '@/config'

export function ModalBack({
  onBack,
  setOnBack,
}: {
  onBack: boolean
  setOnBack: Dispatch<SetStateAction<boolean>>
}) {
  const router = useRouter()
  const { title, desc, button } = POPUP_ATTRIBUTE.browser_back

  return (
    <Dialog open={onBack} onOpenChange={setOnBack}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-destructive'>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' className='border border-slate-300'>
              {button.cancel}
            </Button>
          </DialogClose>
          <Button onClick={() => router.push(Routes.Test)}>{button.continue}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
