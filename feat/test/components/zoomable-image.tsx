'use client'

import { useState } from 'react'
import { default as Image } from 'next/image'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'

interface ZoomableImageProps {
  src: string
  alt: string
  thumbnailClassName?: string
}

export default function ZoomableImage({ src, alt, thumbnailClassName }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const isPresigned = src.includes('X-Amz-Signature')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn('relative h-[443px] w-full', thumbnailClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={isPresigned}
          priority={false}
          className='cursor-zoom-in object-contain'
          onClick={() => setOpen(true)}
        />
      </div>

      <DialogOverlay className='bg-black/50' />
      <DialogContent className='max-w-[85vw]! border-none bg-transparent p-0 sm:rounded-lg [&>button]:hidden'>
        <DialogTitle className='sr-only'>{alt}</DialogTitle>
        <button
          className='absolute -top-10 right-0 z-10'
          onClick={() => setOpen(false)}
          aria-label='Close'
        >
          <X className='h-7 w-7' color='#fff' strokeWidth={3} />
        </button>
        <div className='relative h-[80vh] w-full'>
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized={isPresigned}
            className='cursor-zoom-out object-contain'
            onClick={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
