import type { QuestionDetail } from '@/feat/question-set/dto'
import { cn } from '@/lib/utils'
import { InfoList } from '@/feat/shared/components/info-list'
import { QUESTION_MAX_SCORE } from '@/feat/assessment/dto'
import { TEST_TYPE_LABEL } from '@/config'

export function OptionRow({
  text,
  isMarked,
  className,
}: {
  text: string
  isMarked: boolean
  className?: string
}) {
  return (
    <div className={cn('flex min-h-10 items-center gap-3 rounded-sm border px-3 py-2', className)}>
      <span
        aria-hidden
        className={cn(
          'size-2.5 shrink-0 rounded-full',
          isMarked ? 'bg-primary' : 'bg-foreground/20'
        )}
      />
      <span>{text}</span>
      {isMarked && <span className='sr-only'>(jawaban benar)</span>}
    </div>
  )
}

export function QuestionSetDetailView({ question }: { question: QuestionDetail }) {
  return (
    <div className='flex flex-col gap-6'>
      <InfoList
        items={[
          { label: 'Diklat', value: question.course },
          { label: 'Materi', value: question.subject },
          { label: 'Tipe Soal', value: TEST_TYPE_LABEL[question.testType] },
          { label: 'Bentuk Soal', value: question.formType },
        ]}
      />

      <section className='flex flex-col gap-5 rounded-md border p-5'>
        <header className='flex items-center justify-between border-b pb-3 font-bold'>
          <h3>Pertanyaan</h3>
          <span>Bobot: {QUESTION_MAX_SCORE}</span>
        </header>
        <InfoList
          items={[{ label: 'Pertanyaan', value: question.question }]}
          className='[&_dd]:whitespace-pre-line'
        />
        {question.options.length > 0 && (
          <div className='flex flex-col gap-3'>
            {question.options.map((option) => (
              <OptionRow key={option.id} text={option.text} isMarked={option.isCorrect} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
