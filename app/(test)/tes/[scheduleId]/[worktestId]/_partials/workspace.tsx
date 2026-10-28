'use client'

import type { Socket } from 'socket.io-client'
import type { Session } from 'next-auth'
import type { FormattedQuestion, Slot, StudentProfile, Worktest } from '@/feat/test/dto'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as io from 'socket.io-client'
import { Clock7, Unplug } from 'lucide-react'
import { Button, toast } from '@sisfo-remake/ui'
import { default as TopBar } from './top-bar'
import { default as NavigationContainer } from './navigation-container'
import { default as ModalWorktest } from './modal-worktest'
import { default as FormByType } from './form-by-type'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useConfirmOnBack } from '@/hooks/useConfirmOnBack'
import { initializeAnswer, serializeAnswer } from '@/feat/test/helper'
import {
  CURRENT_NUMBER,
  LAST_NUMBER,
  MARKED_KEY,
  STRUCTURE_C,
  STRUCTURE_D,
} from '@/feat/test/constant'
import { nextSection } from '@/feat/test/api'
import { displayFormName, displayTestType } from '@/config'
import { ModalBack } from '@/app/(test)/tes/[scheduleId]/[worktestId]/_partials/modal-back'

interface WorkSpaceProps extends Worktest {
  current: number
  question: FormattedQuestion
  session: Session
  profile: StudentProfile
  socket_url: string
  socket_path: string
}

const TEXTAREA_MAX_CHARS = 1500

export default function WorkSpace({
  question,
  current,
  session,
  profile,
  socket_url,
  socket_path,
  ...worktest
}: WorkSpaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const socket = useRef<Socket | null>(null)

  const [tempAnswer, setTempAnswer] = useState('')
  const [tempObjectAnswer, setTempObjectAnswer] = useState<Slot[]>([])
  const [lostConnection, setLostConnection] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [navLoading, setNavLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { showModal: onBack, setShowModal: setOnBack } = useConfirmOnBack(true, current)

  const [markedIds, setMarkedIds, removeMarkedIds] = useLocalStorage<string[]>(
    MARKED_KEY(pathname),
    []
  )
  const [lastNumber, setLastNumber, removeLastNumber] = useLocalStorage(LAST_NUMBER(pathname), '')
  const [currentNumber, setCurrentNumber] = useLocalStorage(CURRENT_NUMBER(pathname), '')

  useEffect(() => {
    setMounted(true)
  }, [current])

  const cleanupSocket = () => {
    if (socket.current) {
      socket.current.disconnect()
      socket.current = null
    }
  }

  useEffect(() => {
    setNavLoading(false)
    setIsLoading(false)
  }, [current])

  useEffect(() => {
    const answerSuccessFunc = async () => {
      setMarkedIds(markedIds.filter((id) => id !== question.id))
      if (worktest.isLast && current === worktest.amountQuestion) {
        const { error } = await nextSection(worktest.id)
        if (error) {
          toast.error('Gagal menyelesaikan ujian')
          return
        }

        removeMarkedIds()
        removeLastNumber()
        router.replace(pathname + '/finish')
        return
      } else if (current < worktest.questions.length) {
        setCurrentNumber(String(current + 1))
        router.replace(pathname + `?current=${current + 1}`)
        return
      } else {
        const { error } = await nextSection(worktest.id)
        if (error) {
          toast.error('Terjadi Kesalahan')
          return
        }

        setLastNumber(JSON.stringify(Number(lastNumber) + worktest.questions.length))
        router.replace(pathname + '/intro')
      }
    }

    const answerInvalidFunc = (error: { message?: string }) => {
      setIsLoading(false)
      if (error?.message) {
        toast.error(error.message)
        return
      }
      toast.error('Gagal menyimpan jawaban')
      return
    }

    const disconnectFunc = () => {
      if (!navigator.onLine) {
        setLostConnection(true)
      }
    }

    if (session.access_token && worktest.id) {
      socket.current = io.connect(socket_url, {
        path: socket_path,
        addTrailingSlash: true,
        reconnection: true,
        secure: false,
        transports: ['polling'],
        timeout: 5000,
        query: { workTestId: worktest.id },
        extraHeaders: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      socket.current.on('disconnect', disconnectFunc)

      socket.current.on('answer-success', answerSuccessFunc)

      socket.current?.on('answer-invalid', answerInvalidFunc)
    }

    initializeAnswer(question, worktest.form.id, setTempAnswer, setTempObjectAnswer)

    return () => {
      socket.current?.off('disconnect', disconnectFunc)

      socket.current?.off('answer-success', answerSuccessFunc)

      socket.current?.off('answer-invalid', answerInvalidFunc)
      cleanupSocket()
    }
  }, [
    worktest,
    session,
    question.answer,
    socket_path,
    socket_url,
    current,
    pathname,
    router,
    question,
    markedIds,
    setMarkedIds,
    setLastNumber,
    lastNumber,
    currentNumber,
    setCurrentNumber,
    removeLastNumber,
    removeMarkedIds,
  ])

  const handleSaveAnswers = () => {
    setIsLoading(true)
    socket.current?.emit('store-answer', {
      workTestId: worktest.id,
      questionId: question.id,
      answer: serializeAnswer(worktest.form.id, tempAnswer, tempObjectAnswer, TEXTAREA_MAX_CHARS),
    })
  }

  const modalButtonHandler = () => {
    if (timeUp) {
      router.replace(pathname + '/finish')
      return
    }

    router.refresh()
    setLostConnection(false)
  }

  return (
    <ModalWorktest
      openModal={timeUp || lostConnection}
      setOpenModal={setTimeUp}
      title={lostConnection ? 'Connection Lost' : 'waktu pengerjaan berakhir'}
      description={
        lostConnection
          ? 'Your internet connection was interrupted. Please check your connection. Your progress will be saved once you’re back online'
          : `Waktu pengerjaan ${displayTestType(worktest.schedule.type)} Anda telah berakhir. Jawaban yang Anda kirimkan telah disimpan secara otomatis.`
      }
      icon={lostConnection ? <Unplug /> : <Clock7 />}
      button={
        <Button variant='default' onClick={modalButtonHandler} className='w-full max-w-80'>
          {lostConnection ? 'Refresh' : 'Keluar dari UBK'}
        </Button>
      }
    >
      <ModalBack onBack={onBack} setOnBack={setOnBack} />
      <TopBar
        fullName={profile.fullName}
        nrp={profile.registrationNumber}
        action={() => setTimeUp(true)}
        endTime={worktest.schedule.end}
        type={displayTestType(worktest.schedule.type)}
        course={worktest.schedule.course}
        classroom={worktest.schedule.class}
        formType={displayFormName(worktest.form.name)}
      />
      <NavigationContainer
        lastNumber={lastNumber}
        handleSaveAnswer={handleSaveAnswers}
        current={current - 1}
        questions={worktest.questions}
        questionId={question.id}
        isLoading={isLoading}
        navLoading={navLoading}
        isLast={worktest.isLast}
        type={displayTestType(worktest.schedule.type)}
        formName={displayFormName(worktest.form.name)}
        setNavLoading={setNavLoading}
        tempAnswer={tempAnswer}
        tempObjectAnswer={tempObjectAnswer}
        formId={worktest.form.id}
      >
        <div className='bg-white p-8'>
          <span className='bg-primary/10 text-primary rounded-sm px-2 py-1 text-sm font-bold'>
            SOAL NO. {Number(mounted && lastNumber) + current} DARI {worktest.schedule.total}
          </span>
          {(worktest.form.id === STRUCTURE_C || worktest.form.id === STRUCTURE_D) && (
            <p className='mt-4 text-xl font-bold'>
              {worktest.form.id == STRUCTURE_C
                ? 'Tentukan fungsi kata atau frasa yang tepat (S, P, O, KW, KT) untuk setiap potongan kalimat di bawah ini!'
                : 'Urutkan kata-kata berikut untuk membentuk struktur kalimat yang tepat!'}
            </p>
          )}
          <div className='mt-4'>
            <FormByType
              {...{
                ...question,
                formId: worktest.form.id,
                setTempAnswer,
                tempAnswer,
                tempObjectAnswer,
                setTempObjectAnswer,
                max_textarea: TEXTAREA_MAX_CHARS,
                isLoading: isLoading || navLoading,
              }}
            />
          </div>
        </div>
      </NavigationContainer>
    </ModalWorktest>
  )
}
