'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useConfirmOnBack(shouldBlock: boolean, current?: number) {
  const [showModal, setShowModal] = useState(false)
  const pathname = usePathname()
  const currentUrlRef = useRef('')

  useEffect(() => {
    if (current) {
      currentUrlRef.current = `${pathname}?current=${current}`
    }
  }, [pathname, current])

  useEffect(() => {
    if (!shouldBlock) return
    if (!window.navigation) return

    const handleNavigate = (event: NavigateEvent) => {
      if (event.navigationType === 'traverse') {
        event.preventDefault()
        setShowModal(true)
      }
    }

    window.navigation.addEventListener('navigate', handleNavigate)
    return () => {
      window.navigation.removeEventListener('navigate', handleNavigate)
    }
  }, [shouldBlock])

  return { showModal, setShowModal }
}
