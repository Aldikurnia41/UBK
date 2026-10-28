import { useEffect } from 'react'

interface UseQuizSSEProps<T> {
  onMessage: (data: T) => void
  eventUrl: string
  eventName?: string
}

export function useEventSource<T = []>({
  onMessage,
  eventUrl,
  eventName = '',
}: UseQuizSSEProps<T>) {
  useEffect(() => {
    // No SSE service configured (e.g. local mock mode)
    if (!eventUrl) return

    const es = new EventSource(eventUrl)

    const handler = (event: MessageEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const data = JSON.parse(event.data) as T
      onMessage(data)
    }

    es.addEventListener(eventName, handler)

    return () => {
      es.removeEventListener(eventName, handler)
      es.close()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
