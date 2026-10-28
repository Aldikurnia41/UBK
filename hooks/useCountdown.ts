import { useEffect, useState } from 'react'
import { djs } from '@/lib/utils'

export function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState(Infinity)
  const totalSeconds = Math.floor(timeLeft / 1000)

  useEffect(() => {
    const tick = () => {
      const now = djs()
      const end = djs(`${now.format('YYYY-MM-DD')} ${endTime}`)

      setTimeLeft(Math.max(end.diff(now), 0))
    }

    tick()

    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  return {
    timeLeft,
    totalSeconds,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
