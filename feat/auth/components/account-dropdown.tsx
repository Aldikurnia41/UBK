'use client'

import { useIsMobile } from '@sisfo-remake/ui/hooks'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Icon,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { SidebarSignoutAction } from '@/feat/auth/components/sidebar-signout-action'

export function AccountDropdown() {
  const isMobile = useIsMobile()

  return (
    <DropdownMenuContent
      className={cn('w-65 rounded p-0', !isMobile && 'mb-1')}
      side={!isMobile ? 'right' : 'top'}
      align='end'
    >
      <DropdownMenuGroup className='[&>div]:rounded-none'>
        <DropdownMenuItem className='gap-3 p-3'>
          <Icon type='Ikon Sisfo Badiklat Button' className='text-primary-2' />
          Sisfo Badiklat
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-3 p-3'>
          <Icon type='Ikon Informasi' className='text-primary-2' />
          About Application
        </DropdownMenuItem>
        <DropdownMenuSeparator className='my-2' />
        <DropdownMenuItem className='p-0'>
          <SidebarSignoutAction />
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
