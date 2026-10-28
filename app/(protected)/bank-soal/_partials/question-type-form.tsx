'use client'

import type { QuestionType, QuestionTypePayload } from '@/feat/question-bank/question-type/dto'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { FormField, toast, VideoDefault } from '@sisfo-remake/ui'
import { schemaQuestionType } from '@/feat/question-bank/question-type/schema'
import { QUESTION_FORM_OPTIONS } from '@/feat/question-bank/question-type/constants'
import { createQuizType, updateQuizType } from '@/feat/question-bank/question-type/api'
import { Routes } from '@/config'

interface QuestionTypeFormProps {
  questionType?: QuestionType
  readyonly?: boolean
}

function QuestionTypeForm({ questionType, readyonly }: QuestionTypeFormProps) {
  const objectUrl = useRef<string[] | null>(null)
  const router = useRouter()
  const mode = questionType ? 'update' : 'create'
  const isUpdate = mode === 'update'
  const defaultValues: QuestionTypePayload = {
    ...schemaQuestionType.getDefault(),
    ...(questionType && isUpdate
      ? {
          ...questionType,
          questionForm: QUESTION_FORM_OPTIONS.find(
            (q) => Number(q.value) === questionType.questionForm.id
          )?.value,
          file: [
            {
              id: '',
              type: '',
              name: questionType.file,
              url: questionType.file,
            },
          ],
        }
      : {}),
  }
  const form = useForm({
    defaultValues,
    validators: readyonly ? undefined : { onSubmitAsync: schemaQuestionType },
    onSubmitInvalid: (e) => console.log(e.formApi.getAllErrors()),
    onSubmit: async ({ value }) => {
      const payload = {
        questionForm: value.questionForm,
        description: value.description,
        file: (value.file ? [...value.file] : []).filter(Boolean),
      }

      const action = {
        create: async () => await createQuizType({ payload }),
        update: async () => {
          if (questionType) {
            return await updateQuizType({ id: questionType.id, payload })
          }
          return { data: null, error: { message: 'Question type is needed.' } }
        },
      }
      const { error } = await action[mode]()
      const isQuizType = mode === 'create'
      if (error) {
        return toast.error(
          isQuizType
            ? (error.message ?? 'Gagal Membuat Bentuk Soal')
            : (error.message ?? 'Gagal Mengubah Bentuk Soal')
        )
      }
      toast.success(isQuizType ? 'Berhasil Membuat Data Baru' : 'Berhasil Mengubah Data')
      router.push(`${Routes.QuestionBank}${Routes.QuestionType}`)
    },
  })

  return (
    <FormField
      form={form}
      submit={{ children: 'Simpan' }}
      cancel={{
        children: 'Batal',
        onClick: () => form.reset(),
      }}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className='[&_#desc]:whitespace-pre-line'
      groups={[
        {
          column: 1,
          fields: [
            {
              type: 'select',
              name: 'questionForm',
              label: 'Bentuk Soal',
              placeholder: 'Pilih Bentuk Soal',
              triggerProps: {
                disabled: true,
              },
              options: QUESTION_FORM_OPTIONS,
            },
            {
              type: 'files',
              name: 'file',
              label: 'Tutorial File',
              description: 'Unggah file tutorial untuk bentuk soal ini. Maksimal ukuran file 10MB.',
              placeholder: 'Import Video MP4',
              maxFilesSizeInMB: 10,
              required: true,
              inputProps: { multiple: false, accept: 'video/mp4' },
              renderPreviewVideo: (url, ref) => <VideoDefault ref={ref} src={url} controls />,
              onRemoveFile: () => {
                if (objectUrl.current) {
                  objectUrl.current.forEach((file) => URL.revokeObjectURL(file))
                }
              },
              withFilesPreview: true,
            },
            {
              type: 'textarea',
              name: 'description',
              label: 'Deskripsi',
              placeholder: 'Tulis disini...',
            },
          ],
        },
      ]}
    />
  )
}

export default QuestionTypeForm
