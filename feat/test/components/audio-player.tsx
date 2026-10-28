'use client'

import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '@sisfo-remake/ui'

export default function AudioPlayer({ audio }: { audio: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (playing) audioRef.current.pause()
    else audioRef.current.play()
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime)
    setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    if (!audioRef.current) return

    const time = Number(e.target.value)
    audioRef.current.currentTime = time
    setProgress(time)
  }

  const formatTime = (t: number) => {
    if (!t) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className='flex w-full max-w-[910px] items-center justify-between gap-2 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3 shadow-md sm:gap-3 sm:p-4'>
      <audio
        ref={audioRef}
        src={audio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />
      <Button className='h-10 w-10 shrink-0 rounded-full' onClick={togglePlay}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <div className='w-full'>
        <div className='relative w-full'>
          <div className='absolute h-[6px] w-full origin-left rounded-full bg-gray-200' />
          <div
            className='bg-primary absolute h-[6px] w-0 origin-left rounded-full'
            style={{ width: `${(progress / duration) * 100}%` }}
          />
          <input
            type='range'
            min={0}
            max={duration || 0}
            step={0.01}
            value={progress}
            onChange={(e) => handleSeek(e)}
            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
            aria-label='Video progress'
          />
        </div>
        <div className='mt-3 flex shrink-0 justify-between text-xs font-normal'>
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
