import { yup } from '@/lib/utils'
import { optionalString, requiredString } from '@/lib/helpers'

const fileSchema = yup.object({
  id: optionalString(),
  url: requiredString(3, Infinity),
  name: requiredString(3, Infinity),
  type: optionalString(),
  currentFile: optionalString(),
})

export const schemaQuestionType = yup.object().shape({
  questionForm: requiredString(1),
  description: optionalString(1500),
  file: yup.array().of(fileSchema).default([]).min(1, 'Video tutorial dibutuhkan.'),
})
