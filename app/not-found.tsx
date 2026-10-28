'use client'

import { useRouter } from 'next/navigation'
import { default as Link } from 'next/link'
import { Button, buttonVariants } from '@sisfo-remake/ui'
import { Routes } from '@/config'

export default function NotFound() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(Routes.Dashboard)
    }
  }
  return (
    <div className='flex h-dvh items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-destructive text-9xl font-black'>404</h2>
        <span className='mt-6 text-3xl font-medium'>Page not found❓</span>
        <p className='text-xl'>
          The page you're looking for doesn't exist or may have been removed.
        </p>
        <div className='mt-6 grid grid-cols-2 gap-5'>
          <Link href={Routes.Dashboard} className={buttonVariants({ variant: 'monochome' })}>
            Kembali ke Dashboard
          </Link>
          <Button variant='outline' onClick={handleBack}>
            Kembali ke Halaman Sebelumnya
          </Button>
        </div>
      </div>
    </div>
  )
}
