'use client'

import { useRouter } from 'next/navigation'
import { toast, SidebarMenuButton, Icon } from '@sisfo-remake/ui'
import { logoutSession } from '@/feat/auth/api'

export function SidebarSignoutAction() {
  const router = useRouter()

  return (
    <SidebarMenuButton
      type='submit'
      onClick={async () => {
        const { error } = await logoutSession()

        if (error) {
          return toast.error('Failed to remove session')
        }

        router.refresh()
      }}
      className='h-fit cursor-pointer gap-3 rounded-none'
    >
      <Icon type='Ikon Logout' className='text-primary-2' />
      Log Out
    </SidebarMenuButton>
  )
}
