'use client'

import type { AnyFieldApi } from '@tanstack/react-form'
import type { OptionValue } from '@/type'
import type { TestScheduleDetail } from '@/feat/test-schedule/dto'
import type { CourseOption } from '@/feat/shared/api'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import {
  Button,
  Combobox,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
  toast,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import {
  testScheduleSchema,
  toTestSchedulePayload,
  toTestScheduleValues,
} from '@/feat/test-schedule/schema'
import { createTestSchedule, updateTestSchedule } from '@/feat/test-schedule/api'
import { CancelButton } from '@/feat/shared/components/cancel-button'
import { getClassroomOptions, getSubjectOptions } from '@/feat/shared/api'
import { Routes, TEST_TYPE_OPTIONS, TestType } from '@/config'

/** Shows only the first message per field (yup reports every failed rule) */
const fieldErrors = (field: AnyFieldApi) =>
  field.state.meta.errors
    .slice(0, 1)
    .map((error) =>
      typeof error === 'string' ? { message: error } : (error as { message?: string })
    )

const isInvalid = (field: AnyFieldApi) => field.state.meta.errors.length > 0

function Label({ htmlFor, children }: React.PropsWithChildren<{ htmlFor: string }>) {
  return (
    <FieldLabel htmlFor={htmlFor} className='font-bold'>
      {children}
      <span className='text-destructive'>*</span>
    </FieldLabel>
  )
}

export function TestScheduleForm({
  schedule,
  courseOptions,
  initialSubjectOptions,
  initialClassroomOptions = [],
}: {
  schedule?: TestScheduleDetail | null
  courseOptions: CourseOption[]
  initialSubjectOptions: OptionValue[]
  initialClassroomOptions?: OptionValue[]
}) {
  const router = useRouter()
  const isUpdate = !!schedule
  const [subjectOptions, setSubjectOptions] = useState(initialSubjectOptions)
  const [classroomOptions, setClassroomOptions] = useState(initialClassroomOptions)
  // Combobox meneruskan properti opsi ke DOM, jadi `courseId` tidak ikut dikirim
  const diklatOptions = courseOptions.map(({ value, label }) => ({ value, label }))
  const [isLoadingSubject, startLoadingSubject] = useTransition()
  // "Soal" = tipe tes; soal yang tampil diambil dari Bank Soal sesuai tipe (question served)
  const soalOptions = TEST_TYPE_OPTIONS.map(({ value, label }) => ({
    value,
    label: `Soal ${label}`,
  }))

  const form = useForm({
    defaultValues: toTestScheduleValues(schedule),
    validators: { onSubmitAsync: testScheduleSchema },
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      const payload = toTestSchedulePayload(value)
      const { error } = isUpdate
        ? await updateTestSchedule(schedule.id, payload)
        : await createTestSchedule(payload)

      if (error) {
        return toast.error(error.message)
      }

      toast.success(isUpdate ? 'Berhasil mengubah data' : 'Berhasil menambah data')
      router.push(Routes.TestSchedule)
    },
  })

  // Cross-field rules (tanggal akhir > mulai, durasi <= rentang) are reported on the dependent
  // field; clear those stale submit errors whenever one of the dates changes.
  const clearDependentErrors = () => {
    for (const name of ['startAt', 'endAt', 'duration'] as const) {
      form.setFieldMeta(name, (meta) => ({ ...meta, errorMap: {} }))
    }
  }

  const renderCombobox = (
    field: AnyFieldApi,
    items: OptionValue[],
    placeholder: string,
    search: string,
    onSelect?: (value: string) => void,
    disabled?: boolean
  ) => (
    <Combobox
      items={items}
      selected={String(field.state.value)}
      onSelect={(value) => {
        field.handleChange(value)
        onSelect?.(value)
      }}
      popoverTrigger={{
        id: String(field.name),
        children: placeholder,
        disabled,
        'aria-invalid': isInvalid(field),
        className: 'h-10',
      }}
      commandInput={{ placeholder: search }}
      commandEmpty={{ children: 'Data tidak ditemukan' }}
    />
  )

  return (
    <form
      noValidate
      className='flex flex-col gap-6'
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2'>
        <form.Field name='batchId'>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <Label htmlFor={field.name}>Diklat</Label>
              {renderCombobox(field, diklatOptions, 'Pilih Diklat', 'Cari Diklat', (batchId) => {
                form.setFieldValue('subjectId', '')
                form.setFieldValue('classroomId', '')
                setSubjectOptions([])
                setClassroomOptions([])
                const courseId = courseOptions.find((item) => item.value === batchId)?.courseId
                if (!courseId) return
                startLoadingSubject(async () => {
                  const [{ data: subjects }, { data: classrooms }] = await Promise.all([
                    getSubjectOptions(courseId),
                    getClassroomOptions(batchId),
                  ])
                  setSubjectOptions(subjects)
                  setClassroomOptions(classrooms)
                })
              })}
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>

        <form.Field name='testType'>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <Label htmlFor={field.name}>Soal</Label>
              {renderCombobox(field, soalOptions, 'Pilih Soal', 'Cari Soal')}
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.batchId}>
          {(courseId) => (
            <form.Field name='subjectId'>
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <Label htmlFor={field.name}>Materi</Label>
                  {renderCombobox(
                    field,
                    subjectOptions,
                    isLoadingSubject
                      ? 'Memuat materi...'
                      : courseId
                        ? 'Pilih Materi'
                        : 'Pilih Diklat terlebih dahulu',
                    'Cari Materi',
                    undefined,
                    !courseId || isLoadingSubject
                  )}
                  <FieldError errors={fieldErrors(field)} />
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>

        {/* Sesi Kuis & Ujian (Posttest) di jadwal akademik wajib terikat kelas */}
        <form.Subscribe selector={(state) => [state.values.testType, state.values.batchId]}>
          {([testType, batchId]) =>
            testType &&
            testType !== TestType.Pretest && (
              <form.Field name='classroomId'>
                {(field) => (
                  <Field data-invalid={isInvalid(field)}>
                    <Label htmlFor={field.name}>Kelas</Label>
                    {renderCombobox(
                      field,
                      classroomOptions,
                      isLoadingSubject
                        ? 'Memuat kelas...'
                        : !batchId
                          ? 'Pilih Diklat terlebih dahulu'
                          : classroomOptions.length
                            ? 'Pilih Kelas'
                            : 'Angkatan ini belum punya kelas',
                      'Cari Kelas',
                      undefined,
                      !batchId || isLoadingSubject || !classroomOptions.length
                    )}
                    <FieldError errors={fieldErrors(field)} />
                  </Field>
                )}
              </form.Field>
            )
          }
        </form.Subscribe>

        <form.Field name='startAt' listeners={{ onChange: clearDependentErrors }}>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <Label htmlFor={field.name}>Tanggal Mulai</Label>
              <Input
                id={field.name}
                type='datetime-local'
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid(field)}
              />
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>

        <form.Field name='endAt' listeners={{ onChange: clearDependentErrors }}>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <Label htmlFor={field.name}>Tanggal Akhir</Label>
              <Input
                id={field.name}
                type='datetime-local'
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid(field)}
              />
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>

        <form.Field name='duration' listeners={{ onChange: clearDependentErrors }}>
          {(field) => (
            <Field data-invalid={isInvalid(field)}>
              <Label htmlFor={field.name}>Durasi</Label>
              <Input
                id={field.name}
                type='number'
                inputMode='numeric'
                min={1}
                placeholder='Dalam Satuan Menit'
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid(field)}
              />
              <FieldError errors={fieldErrors(field)} />
            </Field>
          )}
        </form.Field>
      </div>

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
        <CancelButton onConfirm={() => router.push(Routes.TestSchedule)} />
      </div>
    </form>
  )
}
