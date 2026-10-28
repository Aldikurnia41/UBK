'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@sisfo-remake/ui'
import { Routes } from '@/config'

export default function Home() {
  const router = useRouter()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => router.replace(Routes.Dashboard), [])

  return <Loading />
}
