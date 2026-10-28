'use client'

import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { LoaderCircle, Pause, Play, CircleX } from 'lucide-react'
import { Button } from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'

export default function VideoPlayer({ video }: { video: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const syncDuration = () => {
    const el = videoRef.current
    if (!el) return
    if (Number.isFinite(el.duration) && el.duration > 0) {
      setTimeout(() => {
        setDuration(el.duration)
      }, 1000)
    }
  }

  const handleCanPlay = () => {
    syncDuration()
    setIsReady(true)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setProgress(videoRef.current.currentTime)
    syncDuration()
  }

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = Number(e.target.value)
    videoRef.current.currentTime = time
    setProgress(time)
  }

  const handleError = () => {
    setIsReady(false)
    setPlaying(false)
    setHasError(true)
  }

  const retry = () => {
    if (!videoRef.current) return
    setHasError(false)
    setIsReady(false)
    videoRef.current.load() // re-fetch the same src
  }

  const formatTime = (t: number) => {
    if (!t || !Number.isFinite(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className='w-full max-w-227.5'>
      <video
        ref={videoRef}
        src={video}
        width={1920}
        height={443}
        className={cn('w-full', (!isReady || hasError) && 'hidden')}
        preload='auto'
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={syncDuration}
        onDurationChange={syncDuration}
        autoPlay={false}
        onCanPlay={handleCanPlay}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setIsReady(false)}
        onPlaying={() => setIsReady(true)}
        onError={handleError}
      />
      {hasError ? (
        <div className='flex h-127.75 w-full flex-col items-center justify-center gap-2 bg-black/70 text-white'>
          <CircleX className='text-2xl' />
          <span className='text-lg'>Gagal memuat video</span>
          <Button className='h-8 px-3 text-xs' onClick={retry}>
            Coba lagi
          </Button>
        </div>
      ) : (
        !isReady && (
          <div className='flex h-127.75 w-full items-center justify-center bg-black/70'>
            <div className='flex flex-col items-center'>
              <LoaderCircle className='animate-spin text-2xl text-white' />
              <p className='text-lg font-semibold text-white'>Memuat Video...</p>
            </div>
          </div>
        )
      )}
      <div className='mt-4 flex w-full items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-md sm:gap-3 sm:p-4'>
        <Button className='h-9 w-9 shrink-0 rounded-md' onClick={togglePlay} disabled={!isReady}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <div className='relative w-full'>
          <div className='absolute h-1.5 w-full origin-left rounded-full bg-gray-200' />
          <div
            className='bg-primary absolute h-1.5 w-0 origin-left rounded-full'
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          />
          <input
            type='range'
            min={0}
            max={duration || 0}
            step={0.01}
            value={progress}
            onChange={handleSeek}
            disabled={!isReady}
            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
            aria-label='Video progress'
          />
        </div>
        <div className='shrink-0'>
          <span className='text-xs whitespace-nowrap'>
            {isReady ? `${formatTime(progress)} / ${formatTime(duration)}` : 'Memuat...'}
          </span>
        </div>
      </div>
    </div>
  )
}
