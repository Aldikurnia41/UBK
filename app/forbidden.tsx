'use client'

import { useRouter } from 'next/navigation'
import { Button, toast } from '@sisfo-remake/ui'
import { logoutSession } from '@/feat/auth/api'
import { Routes } from '@/config'

export default function Forbidden() {
  const router = useRouter()

  return (
    <div className='flex h-dvh items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-destructive text-9xl font-black'>403</h2>
        <span className='mt-6 text-3xl font-medium'>Access Denied ❌</span>
        <p className='text-xl'>You are not authorized to access this resource.</p>
        <div className='mt-6 grid grid-cols-1 gap-5'>
          <Button
            type='submit'
            onClick={async () => {
              const { error } = await logoutSession()

              if (error) {
                return toast.error('Failed to remove session')
              }

              router.push(Routes.Login)
            }}
          >
            Keluar halaman ini
          </Button>
        </div>
      </div>
    </div>
  )
}
