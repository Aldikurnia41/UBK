'use client'

import type { AnyFieldApi } from '@tanstack/react-form'
import type { OptionValue } from '@/type'
import type { QuestionSetValues } from '@/feat/question-set/schema'
import type { QuestionDetail } from '@/feat/question-set/dto'
import type { TestType } from '@/config'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import {
  Button,
  Combobox,
  Field,
  FieldError,
  FieldLabel,
  Icon,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
  toast,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { CancelButton } from '@/feat/shared/components/cancel-button'
import { getSubjectOptions } from '@/feat/shared/api'
import {
  createEmptyQuestion,
  toQuestionPayloads,
  toQuestionSetValues,
  validateQuestionSet,
} from '@/feat/question-set/schema'
import { MAX_OPTIONS, MIN_OPTIONS, QUESTION_SET_PATH } from '@/feat/question-set/constants'
import { createQuestions, updateQuestion } from '@/feat/question-set/api'
import { QUESTION_MAX_SCORE } from '@/feat/assessment/dto'
import { FORM_TYPE_OPTIONS, FormType, TEST_TYPE_LABEL } from '@/config'

const fieldErrors = (field: AnyFieldApi) =>
  field.state.meta.errors.map((error) => ({ message: String(error) }))

const isInvalid = (field: AnyFieldApi) => field.state.meta.errors.length > 0

function RequiredLabel({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) {
  return (
    <FieldLabel htmlFor={htmlFor} className='font-bold'>
      {children}
      <span className='text-destructive'>*</span>
    </FieldLabel>
  )
}

function useQuestionSetForm(
  testType: TestType,
  questionSet: QuestionDetail | null | undefined,
  onSubmit: (value: QuestionSetValues) => Promise<unknown>
) {
  return useForm({
    defaultValues: toQuestionSetValues(testType, questionSet),
    validators: { onSubmit: validateQuestionSet },
    canSubmitWhenInvalid: true,
    onSubmit: ({ value }) => onSubmit(value),
  })
}

type QuestionSetFormApi = ReturnType<typeof useQuestionSetForm>

export function QuestionSetForm({
  testType,
  questionSet,
  courseOptions,
  initialSubjectOptions,
  formIds,
}: {
  testType: TestType
  questionSet?: QuestionDetail | null
  courseOptions: (OptionValue & { grade: string })[]
  initialSubjectOptions: OptionValue[]
  /** nomor bentuk soal → id bentuk soal di `/forms` */
  formIds: Record<number, number>
}) {
  const router = useRouter()
  const isUpdate = !!questionSet
  const listPath = QUESTION_SET_PATH[testType]
  const [subjectOptions, setSubjectOptions] = useState(initialSubjectOptions)
  const [isLoadingSubject, startLoadingSubject] = useTransition()

  const form = useQuestionSetForm(testType, questionSet, async (value) => {
    const grade =
      courseOptions.find((course) => course.value === value.courseId)?.grade ??
      questionSet?.difficulty ??
      ''
    const payloads = toQuestionPayloads(value, {
      formIds,
      grade,
      active: questionSet?.active ?? true,
    })
    const { error } = isUpdate
      ? await updateQuestion(questionSet.id, payloads[0])
      : await createQuestions(payloads)

    if (error) {
      return toast.error(error.message)
    }

    toast.success(isUpdate ? 'Berhasil mengubah data' : 'Berhasil menambah data')
    router.push(listPath)
  })

  const changeFormType = (next: FormType) => {
    const current = form.getFieldValue('questions')
    form.setFieldValue('formType', next)
    form.setFieldValue(
      'questions',
      (current.length ? current : [createEmptyQuestion(next)]).map((question) => ({
        ...createEmptyQuestion(next),
        question: question.question,
        options:
          next === FormType.PilihanGanda && question.options.length >= MIN_OPTIONS
            ? question.options
            : createEmptyQuestion(next).options,
        correctIndex: next === FormType.PilihanGanda ? question.correctIndex : -1,
      }))
    )
  }

  const changeCourse = (courseId: string) => {
    form.setFieldValue('subjectId', '')
    setSubjectOptions([])
    if (!courseId) return
    startLoadingSubject(async () => {
      const { data } = await getSubjectOptions(courseId)
      setSubjectOptions(data)
    })
  }

  return (
    <form
      noValidate
      className='flex flex-col gap-6'
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-2'>
        <form.Field name='courseId'>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <RequiredLabel htmlFor={field.name}>Diklat</RequiredLabel>
              <Combobox
                items={courseOptions}
                selected={field.state.value}
                onSelect={(value) => {
                  field.handleChange(value)
                  changeCourse(value)
                }}
                popoverTrigger={{
                  id: field.name,
                  children: 'Pilih Diklat',
                  'aria-invalid': isInvalid(field),
                  className: 'h-10',
                }}
                commandInput={{ placeholder: 'Cari Diklat' }}
                commandEmpty={{ children: 'Data tidak ditemukan' }}
              />
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.courseId}>
          {(courseId) => (
            <form.Field name='subjectId'>
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <RequiredLabel htmlFor={field.name}>Materi</RequiredLabel>
                  <Combobox
                    items={subjectOptions}
                    selected={field.state.value}
                    onSelect={(value) => field.handleChange(value)}
                    popoverTrigger={{
                      id: field.name,
                      children: isLoadingSubject
                        ? 'Memuat materi...'
                        : courseId
                          ? 'Pilih Materi'
                          : 'Pilih Diklat terlebih dahulu',
                      disabled: !courseId || isLoadingSubject,
                      'aria-invalid': isInvalid(field),
                      className: 'h-10',
                    }}
                    commandInput={{ placeholder: 'Cari Materi' }}
                    commandEmpty={{ children: 'Data tidak ditemukan' }}
                  />
                  <FieldError errors={fieldErrors(field)} />
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-2'>
        <Field>
          <RequiredLabel htmlFor='testType'>Tipe Soal</RequiredLabel>
          <Input id='testType' value={TEST_TYPE_LABEL[testType]} disabled />
        </Field>
        <form.Field name='formType'>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <RequiredLabel htmlFor={field.name}>Bentuk Soal</RequiredLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => changeFormType(value as FormType)}
              >
                <SelectTrigger id={field.name} className='w-full' aria-invalid={isInvalid(field)}>
                  <SelectValue placeholder='Pilih Bentuk Soal' />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => state.values.formType}>
        {(formType) =>
          formType && (
            <form.Field name='questions' mode='array'>
              {(questionsField) => (
                <div className='flex flex-col gap-5'>
                  {questionsField.state.value.map((_, questionIndex) => (
                    <QuestionCard
                      key={questionIndex}
                      form={form}
                      index={questionIndex}
                      formType={formType}
                      canRemove={!isUpdate && questionsField.state.value.length > 1}
                      onRemove={() => questionsField.removeValue(questionIndex)}
                      footer={
                        // Edit = satu pertanyaan (question-bank menyimpan per pertanyaan)
                        !isUpdate &&
                        questionIndex === questionsField.state.value.length - 1 && (
                          <div className='flex justify-end'>
                            <Button
                              type='button'
                              variant='default'
                              onClick={() =>
                                questionsField.pushValue(createEmptyQuestion(formType))
                              }
                            >
                              <Plus /> Tambah Pertanyaan
                            </Button>
                          </div>
                        )
                      }
                    />
                  ))}
                  <FieldError errors={fieldErrors(questionsField)} />
                </div>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>

      <div className='flex justify-end gap-2'>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type='submit' variant='default' className='relative' disabled={isSubmitting}>
              {isSubmitting && (
                <Spinner className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
              )}
              <span className={cn(isSubmitting && 'opacity-0')}>Simpan</span>
            </Button>
          )}
        </form.Subscribe>
        <CancelButton
          onConfirm={() => {
            form.reset()
            router.push(listPath)
          }}
        />
      </div>
    </form>
  )
}

function QuestionCard({
  form,
  index,
  formType,
  canRemove,
  onRemove,
  footer,
}: {
  form: QuestionSetFormApi
  index: number
  formType: FormType
  canRemove: boolean
  onRemove: () => void
  footer?: React.ReactNode
}) {
  const isMultipleChoice = formType === FormType.PilihanGanda

  return (
    <section className='flex flex-col gap-5 rounded-md border p-5'>
      <header className='flex items-center justify-between border-b pb-3'>
        <h3 className='font-bold'>Pertanyaan No. {index + 1}</h3>
        <Button
          type='button'
          size='icon'
          variant='outline-destructive'
          className='size-9'
          aria-label={`Hapus pertanyaan no. ${index + 1}`}
          disabled={!canRemove}
          onClick={onRemove}
        >
          <X />
        </Button>
      </header>

      <form.Field name={`questions[${index}].question`}>
        {(field) => (
          <Field data-invalid={isInvalid(field)}>
            <RequiredLabel htmlFor={field.name}>Pertanyaan</RequiredLabel>
            <Textarea
              id={field.name}
              placeholder='Masukkan Pertanyaan'
              className='min-h-20'
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={isInvalid(field)}
            />
            <FieldError errors={fieldErrors(field)} />
          </Field>
        )}
      </form.Field>

      {isMultipleChoice && (
        <div className='flex flex-col gap-3'>
          <FieldLabel className='font-bold'>Opsi Jawaban</FieldLabel>
          <form.Field name={`questions[${index}].correctIndex`}>
            {(correctField) => (
              <form.Field name={`questions[${index}].options`} mode='array'>
                {(optionsField) => (
                  <div className='flex flex-col gap-3 rounded-md border p-4'>
                    <p className='text-sm'>Pilih salah satu jawaban yang benar</p>
                    <RadioGroup
                      value={`${correctField.state.value}`}
                      onValueChange={(value) => correctField.handleChange(Number(value))}
                      className='gap-3'
                    >
                      {optionsField.state.value.map((_, optionIndex) => (
                        <form.Field
                          key={optionIndex}
                          name={`questions[${index}].options[${optionIndex}].text`}
                        >
                          {(optionField) => (
                            <div className='flex flex-col gap-1'>
                              <div className='flex items-center gap-2'>
                                <label
                                  className={cn(
                                    'focus-within:ring-ring/20 flex h-10 grow items-center gap-3 rounded-sm border px-3 focus-within:ring-[3px]',
                                    isInvalid(optionField) && 'border-destructive'
                                  )}
                                >
                                  <RadioGroupItem
                                    value={`${optionIndex}`}
                                    aria-label={`Tandai opsi ${optionIndex + 1} sebagai jawaban benar`}
                                  />
                                  <input
                                    className='placeholder:text-muted-foreground h-full grow bg-transparent outline-none'
                                    placeholder='Masukkan Jawaban'
                                    value={optionField.state.value}
                                    onBlur={optionField.handleBlur}
                                    onChange={(event) =>
                                      optionField.handleChange(event.target.value)
                                    }
                                  />
                                </label>
                                <Button
                                  type='button'
                                  size='icon'
                                  variant='outline-destructive'
                                  aria-label={`Hapus opsi ${optionIndex + 1}`}
                                  disabled={optionsField.state.value.length <= MIN_OPTIONS}
                                  onClick={() => {
                                    optionsField.removeValue(optionIndex)
                                    const correct = correctField.state.value
                                    if (correct === optionIndex) correctField.handleChange(-1)
                                    if (correct > optionIndex)
                                      correctField.handleChange(correct - 1)
                                  }}
                                >
                                  <Icon type='Ikon Hapus' />
                                </Button>
                              </div>
                              <FieldError errors={fieldErrors(optionField)} />
                            </div>
                          )}
                        </form.Field>
                      ))}
                    </RadioGroup>
                    <FieldError
                      errors={[...fieldErrors(correctField), ...fieldErrors(optionsField)]}
                    />
                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        variant='default'
                        disabled={optionsField.state.value.length >= MAX_OPTIONS}
                        onClick={() => optionsField.pushValue({ text: '' })}
                      >
                        <Plus /> Tambah Opsi Jawaban
                      </Button>
                    </div>
                  </div>
                )}
              </form.Field>
            )}
          </form.Field>
        </div>
      )}

      {/* Backend menilai setiap pertanyaan dengan skor 0–1, jadi bobot tetap 1 */}
      <Field>
        <FieldLabel htmlFor={`weight-${index}`} className='font-bold'>
          Bobot Soal
        </FieldLabel>
        <Input id={`weight-${index}`} value={QUESTION_MAX_SCORE} disabled readOnly />
      </Field>

      {footer}
    </section>
  )
}
