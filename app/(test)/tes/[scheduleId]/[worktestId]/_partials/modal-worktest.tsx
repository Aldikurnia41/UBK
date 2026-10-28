import type { Dispatch, SetStateAction } from 'react'
import { DialogContent, Dialog, DialogTitle } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'

export default function ModalWorktest({
  children,
  openModal,
  setOpenModal,
  title,
  description,
  icon,
  button,
  className,
}: {
  children: React.ReactNode
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  title: string
  description: string
  icon: React.ReactNode
  button: React.ReactNode
  className?: string
}) {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          'w-full max-w-[450px] overflow-visible border-none bg-gray-200 p-0 focus-within:border-none',
          className
        )}
      >
        <div className='relative'>
          <DialogTitle></DialogTitle>
          <div className={cn('bg-primary h-5 w-full rounded-t-lg')} />
          <div
            className={cn(
              'bg-primary absolute top-0 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-sm text-white',
              icon
            )}
          >
            {icon}
          </div>
        </div>

        <div className='text-center'>
          <h2 className='text-lg font-bold'>{title}</h2>
          <div className='mt-3 space-y-4'>
            <div className='flex flex-col gap-2 rounded-b-lg bg-white px-16 pt-4 pb-11'>
              <p>{description}</p>
              <div>{button}</div>
            </div>
          </div>
        </div>
      </DialogContent>
      {children}
    </Dialog>
  )
}
