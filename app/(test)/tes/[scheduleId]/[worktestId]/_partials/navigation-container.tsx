import type { Dispatch, SetStateAction } from 'react'
import type { FormattedQuestion, Slot } from '@/feat/test/dto'
import { default as React, useEffect, useEffectEvent, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import {
  Button,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { MARKED_KEY, POPUP_ATTRIBUTE, STRUCTURE_C, STRUCTURE_D } from '@/feat/test/constant'

export default function NavigationContainer({
  children,
  current,
  questions,
  questionId,
  lastNumber,
  isLoading,
  isLast,
  type,
  formName,
  navLoading,
  tempAnswer,
  tempObjectAnswer,
  formId,
  setNavLoading,
  handleSaveAnswer,
}: {
  children: React.ReactNode
  current: number
  questions: FormattedQuestion[]
  questionId: string
  lastNumber: string
  isLoading: boolean
  isLast: boolean
  type: string
  /** Label bentuk soal (Pilihan Ganda / Essay) untuk judul panel nomor soal */
  formName: string
  navLoading: boolean
  tempAnswer: string
  tempObjectAnswer: Slot[]
  formId: number
  setNavLoading: Dispatch<SetStateAction<boolean>>
  handleSaveAnswer: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  const [markedIds, setMarkedIds] = useLocalStorage<string[]>(MARKED_KEY(pathname), [])

  const answeredQuestionsIds = questions
    .filter((question) => question.answer)
    .map((question) => question.id)
  const isMarked = markedIds.includes(questionId)

  const toggleMark = () => {
    setMarkedIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    )
  }
  const toPreviousQuestion = () => {
    setNavLoading(true)
    router.push(pathname + `?current=${current + 1 - 1}`)
  }
  const navigateToTarget = (idx: number) => {
    setNavLoading(true)
    router.push(pathname + `?current=${idx + 1}`)
  }

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    localStorage.setItem(MARKED_KEY(pathname), JSON.stringify(markedIds))
  }, [markedIds, pathname])

  return (
    <div className='flex flex-col gap-5 p-4 xl:h-[calc(100dvh-85px)] xl:flex-row'>
      <div className='@container flex flex-1 flex-col gap-4'>
        <div className='flex-1 overflow-y-auto rounded-xl bg-white p-8 shadow'>{children}</div>
        <NavigationButton
          {...{ current, questions, isMarked, questionId, formId, mounted }}
          handleSaveAnswer={handleSaveAnswer}
          handlePrevious={toPreviousQuestion}
          handleToggle={toggleMark}
          isLoading={isLoading}
          navLoading={navLoading}
          isLast={isLast}
          type={type}
          tempAnswer={tempAnswer}
          tempObjectAnswer={tempObjectAnswer}
        />
      </div>
      <div className='@container w-full rounded-lg bg-white p-5 shadow xl:max-w-90'>
        <h3 className='mb-4 text-lg font-bold'>Total Pertanyaan {formName}</h3>
        <div className='mb-8 grid max-h-[40dvh] w-full grid-cols-5 content-start gap-2 overflow-y-auto xl:min-h-80 @2xl:grid-cols-10'>
          {questions.map((val, idx) => {
            const isMarked = markedIds.includes(val.id)
            const isAnswered = answeredQuestionsIds.includes(val.id)
            return (
              <span
                onClick={() => !navLoading && navigateToTarget(idx)}
                key={idx}
                className={cn(
                  'relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-[#C8CDD0] bg-[#C8CDD0]/10 text-black select-none',
                  idx === current && 'bg-primary! border-none text-white',
                  isAnswered && 'bg-success border-none text-white',
                  mounted &&
                    isMarked &&
                    "after:bg-destructive after:absolute after:top-0 after:right-0 after:size-12 after:content-[''] after:[clip-path:polygon(50%_0%,100%_0,100%_50%)]"
                )}
              >
                {!navLoading && mounted ? (
                  Number(lastNumber) + (idx + 1)
                ) : (
                  <LoaderCircle className='animate-spin' />
                )}
              </span>
            )
          })}
        </div>
        <hr className='border border-gray-100' />
        <div className='flex flex-col gap-3 p-2.5'>
          <div className='flex items-center gap-3'>
            <span className='bg-primary size-6 rounded-sm'></span>
            <p className='text-sm'>Pertanyaan saat ini</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='bg-success size-6 rounded-sm'></span>
            <p className='text-sm'>Pertanyaan sudah dijawab</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className="after:bg-destructive relative size-6 overflow-hidden rounded-sm border-2 border-gray-200 after:absolute after:top-0 after:right-0 after:size-6 after:content-[''] after:[clip-path:polygon(50%_0%,100%_0,100%_50%)]"></span>
            <p className='text-sm'>Pertanyaan yang ditandai</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='size-6 rounded-sm border-2 border-gray-200 bg-white'></span>
            <p className='text-sm'>Pertanyaan belum dijawab</p>
          </div>
        </div>
      </div>
      <NavigationButton
        {...{ current, questions, isMarked, questionId, formId, mounted }}
        handleSaveAnswer={handleSaveAnswer}
        handlePrevious={toPreviousQuestion}
        handleToggle={toggleMark}
        isStickyNavigation
        isLoading={isLoading}
        navLoading={navLoading}
        isLast={isLast}
        type={type}
        tempAnswer={tempAnswer}
        tempObjectAnswer={tempObjectAnswer}
      />
    </div>
  )
}

function NavigationButton({
  current,
  questions,
  isMarked,
  handleSaveAnswer,
  handlePrevious,
  handleToggle,
  isStickyNavigation = false,
  isLoading,
  navLoading,
  isLast,
  type,
  tempAnswer,
  tempObjectAnswer,
  questionId,
  formId,
  mounted,
}: {
  current: number
  questions: FormattedQuestion[]
  isMarked: boolean
  isStickyNavigation?: boolean
  isLoading: boolean
  navLoading: boolean
  isLast: boolean
  type: string
  tempAnswer: string
  tempObjectAnswer: Slot[]
  questionId: string
  formId: number
  mounted: boolean
  handleSaveAnswer: () => void
  handlePrevious: () => void
  handleToggle: () => void
}) {
  return (
    <div
      className={cn(
        'flex flex-row flex-wrap justify-between gap-3 rounded-lg bg-white p-3',
        current === 0 && 'justify-end',
        !isStickyNavigation && 'hidden shadow xl:flex',
        isStickyNavigation && '@container sticky bottom-0 border-t-2 xl:hidden'
      )}
    >
      <Button
        hidden={current === 0}
        disabled={isLoading || navLoading}
        className={cn(
          'flex-1 bg-gray-200 p-4 text-black hover:bg-gray-300/80',
          !isStickyNavigation && '@lg:flex-none'
        )}
        onClick={handlePrevious}
      >
        <span>{'<'}</span>
        Kembali ke Pertanyaan Sebelumnya
      </Button>
      <div
        className={cn(
          'flex flex-1 flex-col gap-2 @lg:flex-row',
          !isStickyNavigation && 'justify-end @lg:flex-none'
        )}
      >
        <Button
          variant='outline'
          disabled={isLoading || navLoading}
          className={cn('min-w-62.5', isStickyNavigation && 'flex-1')}
          onClick={handleToggle}
        >
          {mounted && (isMarked ? 'Hapus Tanda' : 'Tandai Soal Ini')}
        </Button>
        <ModalConfirmationSaveAnswer
          {...{
            current,
            questions,
            handleSaveAnswer,
            isLoading,
            isLast,
            type,
            navLoading,
            questionId,
            tempAnswer,
            tempObjectAnswer,
            formId,
          }}
        />
      </div>
    </div>
  )
}

function ModalConfirmationSaveAnswer({
  current,
  questions,
  handleSaveAnswer,
  isLoading,
  navLoading,
  isLast,
  type,
  questionId,
  tempAnswer,
  tempObjectAnswer,
  formId,
}: {
  current: number
  questions: FormattedQuestion[]
  isLoading: boolean
  navLoading: boolean
  isLast: boolean
  type: string
  tempAnswer: string
  tempObjectAnswer: Slot[]
  questionId: string
  formId: number
  handleSaveAnswer: () => void
}) {
  const [openModal, setOpenModal] = useState(false)
  const next_type = current + 1 >= questions.length
  const finish_button = next_type && isLast
  const currentQuestionIndex = questions.findIndex((question) => question.id === questionId)
  const [countUnanswered, setCountUnanswered] = useState(0)

  const isAnswered = (answer: string | Slot[] | undefined) => {
    if (formId === STRUCTURE_C) {
      return Array.isArray(answer) ? answer.filter((a) => a?.answer).length > 0 : !!answer
    }

    return !!answer
  }

  const checkAllQuestions = useEffectEvent((current: string | Slot[]) => {
    const answer =
      formId === STRUCTURE_D && Array.isArray(current)
        ? current
            .filter((c) => c?.value)
            .map((c) => c?.value)
            .join(' ')
        : current
    const mappedQuestion = questions
      .map((q) => ({
        id: q.id,
        answer: q.answer,
      }))
      .with(currentQuestionIndex, {
        id: questionId,
        // prefer the live draft for the current question, fall back to what's saved
        answer: answer ?? questions[currentQuestionIndex]?.answer,
      })

    setCountUnanswered(questions.length - mappedQuestion.filter((q) => isAnswered(q.answer)).length)
  })

  useEffect(() => {
    checkAllQuestions(
      formId === STRUCTURE_C || formId === STRUCTURE_D ? tempObjectAnswer : tempAnswer
    )
  }, [tempAnswer, tempObjectAnswer, formId, questions])

  const handleButtonClick = () => {
    if (!next_type) {
      handleSaveAnswer()
    } else {
      setOpenModal(true)
    }
  }

  const { title, desc, button } = isLast
    ? POPUP_ATTRIBUTE.finish
    : !countUnanswered
      ? POPUP_ATTRIBUTE.next
      : POPUP_ATTRIBUTE.unanswered_next

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <Button
        variant='default'
        className={cn('min-w-62.5', finish_button && 'bg-success text-white hover:bg-green-700')}
        disabled={isLoading || navLoading}
        onClick={handleButtonClick}
      >
        {!isLoading ? (
          finish_button ? (
            `Selesaikan ${type}`
          ) : (
            'Simpan dan Lanjutkan'
          )
        ) : (
          <LoaderCircle className='animate-spin' />
        )}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-destructive'>{title.replace('%t', type)}</DialogTitle>
          <DialogDescription>{desc.replace('%q', `${countUnanswered}`)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' className='border border-slate-300'>
              {button.cancel}
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              handleSaveAnswer()
              setOpenModal(false)
            }}
          >
            {button.continue.replace('%t', type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
