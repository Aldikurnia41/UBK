'use client'

import type { TestScheduleDetail } from '@/feat/test-schedule/dto'
import type { ScoredQuestion, WorktestDetail } from '@/feat/assessment/dto'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  FieldError,
  Input,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { InfoList } from '@/feat/shared/components/info-list'
import { saveWorktestScores } from '@/feat/assessment/api'
import { FormType, Routes } from '@/config'

type EssayScores = Record<string, string>

const validateEssayScore = (question: ScoredQuestion, value: string) => {
  if (value === '') return 'Nilai wajib diisi'
  const score = Number(value)
  if (Number.isNaN(score)) return 'Hanya boleh diisi dengan angka'
  if (score < 0 || score > question.weight) return `Nilai harus 0 – ${question.weight}`
  return ''
}

function MultipleChoiceCard({ question }: { question: ScoredQuestion }) {
  return (
    <section className='flex flex-col gap-4 rounded-md border p-5'>
      <div className='flex flex-col gap-2 border-b pb-4'>
        <header className='flex items-center justify-between gap-4 font-bold'>
          <h3>Pertanyaan</h3>
          <span className='text-primary'>Bobot Pertanyaan: {question.weight}</span>
        </header>
        <p className='whitespace-pre-line'>{question.question}</p>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='font-bold'>Jawaban</p>
        {question.options.map((option) => (
          <div
            key={option.id}
            className={cn(
              'flex min-h-10 items-center gap-3 rounded-sm border px-3 py-2',
              option.isCorrect && 'border-green-600 text-green-700',
              option.isSelected && !option.isCorrect && 'border-destructive text-destructive'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                option.isSelected ? 'bg-primary' : 'bg-foreground/20'
              )}
            />
            <span className='grow'>{option.text}</span>
            {option.isSelected && <span className='text-xs font-medium'>Jawaban siswa</span>}
            {option.isCorrect && !option.isSelected && (
              <span className='text-xs font-medium'>Kunci jawaban</span>
            )}
          </div>
        ))}
        {!question.answer && (
          <p className='text-muted-foreground text-sm'>Siswa tidak menjawab pertanyaan ini.</p>
        )}
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <label htmlFor={`score-${question.id}`} className='font-bold'>
            Nilai
          </label>
          <span className='text-muted-foreground text-xs'>
            Nilai terisi otomatis untuk bentuk soal Pilihan Ganda
          </span>
        </div>
        <Input id={`score-${question.id}`} value={question.score ?? 0} disabled readOnly />
      </div>
    </section>
  )
}

function EssayCard({
  question,
  value,
  error,
  readonly,
  onChange,
}: {
  question: ScoredQuestion
  value: string
  error: string
  readonly: boolean
  onChange: (value: string) => void
}) {
  return (
    <section className='flex flex-col gap-3 rounded-md border p-3'>
      <div className='flex flex-col gap-4 rounded-md border p-3 sm:flex-row'>
        <div className='flex grow flex-col gap-2'>
          <h3 className='font-bold'>Pertanyaan</h3>
          <p className='whitespace-pre-line'>{question.question}</p>
        </div>
        <div className='flex w-full shrink-0 flex-col items-center gap-2 rounded-md border p-3 sm:w-28'>
          <label htmlFor={`score-${question.id}`}>Nilai</label>
          <Input
            id={`score-${question.id}`}
            type='number'
            inputMode='decimal'
            step={0.01}
            min={0}
            max={question.weight}
            placeholder='...'
            className='text-center'
            value={value}
            disabled={readonly}
            aria-invalid={!!error}
            onChange={(event) => onChange(event.target.value)}
          />
          <span className='text-sm'>Bobot: {question.weight}</span>
        </div>
      </div>
      {error && <FieldError className='px-1'>{error}</FieldError>}
      <div className='flex flex-col gap-2 rounded-md border p-3'>
        <h4 className='font-bold'>Jawaban</h4>
        <p className='whitespace-pre-line'>{question.answer || '-'}</p>
      </div>
    </section>
  )
}

export function WorktestScoreForm({
  worktest,
  schedule,
}: {
  worktest: WorktestDetail
  schedule: TestScheduleDetail
}) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()
  const readonly = schedule.isCalculated
  const multipleChoice = worktest.questions.filter((q) => q.type === FormType.PilihanGanda)
  const essays = worktest.questions.filter((q) => q.type === FormType.Essay)
  const [scores, setScores] = useState<EssayScores>(() =>
    Object.fromEntries(essays.map((q) => [q.id, q.score === null ? '' : `${q.score}`]))
  )
  const [showErrors, setShowErrors] = useState(false)
  const errors = Object.fromEntries(
    essays.map((question) => [question.id, validateEssayScore(question, scores[question.id])])
  )

  const handleSave = () => {
    setShowErrors(true)
    if (Object.values(errors).some(Boolean)) {
      return toast.error('Lengkapi nilai essay sesuai bobot pertanyaan')
    }

    startSaving(async () => {
      const { error } = await saveWorktestScores(
        worktest.id,
        essays.flatMap((q) =>
          q.answerId === null
            ? []
            : [
                {
                  answerId: q.answerId,
                  score: Number(scores[q.id]),
                },
              ]
        )
      )

      if (error) {
        return void toast.error(error.message)
      }

      toast.success('Berhasil menyimpan nilai')
      router.push(`${Routes.Assessment}/${schedule.id}`)
    })
  }

  const saveButton = essays.length > 0 && !readonly && (
    <Button variant='default' onClick={handleSave} disabled={isSaving}>
      {isSaving && <Spinner />}
      Simpan
    </Button>
  )

  const multipleChoiceList = (
    <div className='flex flex-col gap-5'>
      {multipleChoice.map((question) => (
        <MultipleChoiceCard key={question.id} question={question} />
      ))}
    </div>
  )

  const essayList = (
    <div className='flex flex-col gap-5'>
      {essays.map((question) => (
        <EssayCard
          key={question.id}
          question={question}
          value={scores[question.id]}
          error={showErrors ? errors[question.id] : ''}
          readonly={readonly}
          onChange={(value) => setScores((prev) => ({ ...prev, [question.id]: value }))}
        />
      ))}
    </div>
  )

  return (
    <div className='flex flex-col gap-6'>
      <InfoList
        columns={2}
        className='border-b pb-6'
        items={[
          { label: 'Nama Siswa', value: worktest.studentName },
          { label: 'Materi', value: schedule.subject },
          { label: 'Jadwal Tes', value: `${schedule.startAtLabel} - ${schedule.endAtLabel}` },
          { label: 'Soal', value: schedule.questionSet },
          { label: 'Tipe Tes', value: schedule.testTypeLabel },
          { label: 'Bentuk Soal', value: schedule.formType },
          {
            label: 'Nilai Akhir',
            value: worktest.isGraded ? `${worktest.score}` : 'Belum dinilai',
          },
        ]}
      />

      {multipleChoice.length > 0 && essays.length > 0 ? (
        <Tabs defaultValue={FormType.PilihanGanda} className='gap-5'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <TabsList>
              <TabsTrigger value={FormType.PilihanGanda}>Pilihan Ganda</TabsTrigger>
              <TabsTrigger value={FormType.Essay}>Essay</TabsTrigger>
            </TabsList>
            {saveButton}
          </div>
          <TabsContent value={FormType.PilihanGanda}>{multipleChoiceList}</TabsContent>
          <TabsContent value={FormType.Essay}>{essayList}</TabsContent>
        </Tabs>
      ) : (
        <>
          {multipleChoice.length > 0 && multipleChoiceList}
          {essays.length > 0 && essayList}
          {saveButton && <div className='flex justify-end'>{saveButton}</div>}
        </>
      )}
    </div>
  )
}
