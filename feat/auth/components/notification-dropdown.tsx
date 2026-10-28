'use client'

import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import type { NewNotification, Notification } from '@/feat/notification/dto'
import { useEffect, useRef, useState } from 'react'
import { default as Link } from 'next/link'
import { useIsMobile } from '@sisfo-remake/ui/hooks'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  toast,
} from '@sisfo-remake/ui'
import { cn, djs } from '@/lib/utils'
import { transformNotification } from '@/feat/notification/dto'
import { readAll } from '@/feat/notification/api'
import { Routes } from '@/config'

function MessageBox(props: Notification) {
  const { author, date, message, isRead } = props

  return (
    <DropdownMenuItem
      className={cn(
        'flex flex-col items-start gap-1 rounded border-[0.5px] border-slate-300 p-2',
        !isRead && 'bg-gray-200/50!'
      )}
      onSelect={(e) => e.preventDefault()}
    >
      <div className='flex w-full flex-col flex-wrap justify-between gap-1 @md/notif-content:flex-row'>
        <span className='font-semibold wrap-anywhere'>{author}</span>
        <span className='wrap-anywhere text-slate-500'>
          {djs(date).format('D MMMM YYYY [pukul] HH:mm')}
        </span>
      </div>
      <div className='wrap-anywhere text-slate-500'>{message}</div>
    </DropdownMenuItem>
  )
}

export function NotificationDropdown({
  notifications: defaultNotif,
  socketUrl,
  socketPath,
  token,
  author,
  canManageNotif,
  instituteSelected,
}: {
  notifications: Notification[]
  socketUrl: string
  socketPath: string
  token: string
  author: string
  canManageNotif: boolean
  instituteSelected: string
}) {
  const socketOptionRef = useRef<{ url: string; option: Partial<ManagerOptions & SocketOptions> }>({
    url: socketUrl,
    option: {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
        'institute-selected': instituteSelected,
      },
      path: socketPath,
      secure: false,
      addTrailingSlash: true,
      transports: ['polling'],
      timeout: 5000,
    },
  })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(defaultNotif)
  const isMobile = useIsMobile()
  const hasUnreadMessage = !open && notifications.some((item) => !item.isRead)

  const handleRead = async () => {
    if (!canManageNotif) return
    const { error } = await readAll()
    if (error) {
      return toast.error(error.message)
    }
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  useEffect(() => {
    async function initSocket() {
      const { io } = await import('socket.io-client')
      const { url, option } = socketOptionRef.current

      // No socket service configured (e.g. local mock mode) — skip the polling connection
      if (!url) return

      setSocket(io(url, option))
    }

    initSocket()
  }, [])

  useEffect(() => {
    if (!socket) return

    function getNotification(value: NewNotification) {
      if (value.institute !== instituteSelected || value.app !== 'ak') return

      const newNotif = transformNotification({
        data: value,
        author,
      })

      setNotifications((prev) => [newNotif, ...prev])
    }

    socket.on('connect', () => console.log('Connected to the socket.'))
    socket.on('disconnect', () => console.log('Disconnected from socket...'))
    socket.on('new-notif', getNotification)

    return () => {
      socket.off('new-notif', getNotification)
      socket.disconnect()
    }
  }, [author, instituteSelected, socket])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='absolute top-7 right-14 size-7 group-data-[state=collapsed]:relative group-data-[state=collapsed]:top-0 group-data-[state=collapsed]:right-auto'
        >
          <Icon type='Ikon Notifikasi Default' className='size-5' />
          {hasUnreadMessage && (
            <div className='absolute top-1 right-1'>
              <span className='relative flex size-2'>
                <span className='bg-destructive/75 absolute inline-flex h-full w-full animate-ping rounded-full'></span>
                <span className='bg-destructive relative inline-flex size-2 rounded-full'></span>
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='@container/notif-content rounded-md p-0 max-md:mx-2.5 max-md:w-screen max-md:max-w-[calc(100vw-20px)] md:w-md lg:w-138.5'
        side={!isMobile ? 'right' : 'bottom'}
        align='end'
        onCloseAutoFocus={() => handleRead()}
      >
        <DropdownMenuGroup className='bg-background sticky top-0 z-50 flex items-center justify-between p-6'>
          <p className='text-foreground text-lg font-bold'>Notifikasi</p>
          <DropdownMenuItem asChild>
            <Button
              variant='ghost'
              className='size-10 data-highlighted:border-0 data-highlighted:ring-0'
              onClick={() => setOpen(false)}
            >
              <Icon type='Ikon Close' className='size-6' />
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup className='space-y-4 px-6 pb-6'>
          {notifications.slice(0, 5).map((item) => (
            <MessageBox key={item.id} {...item} />
          ))}
          <DropdownMenuItem
            className={cn(
              notifications.length && 'ml-auto w-fit rounded-none',
              'justify-center py-0 hover:bg-transparent!'
            )}
            onSelect={(e) => e.preventDefault()}
          >
            {notifications.length ? (
              <Link
                className='text-primary'
                href={Routes.Notification}
                onClick={() => setOpen(false)}
              >
                Lihat Semua Notifikasi
              </Link>
            ) : (
              <div className='flex h-60 items-center font-bold'>Data Kosong</div>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
