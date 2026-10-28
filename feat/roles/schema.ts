import { yup } from '@/lib/utils'
import { requiredString, requiredStringInArray } from '@/lib/helpers'

export const rolesSchema = yup.object({
  role: requiredString(2, 30),
  permissions: requiredStringInArray(),
  // permissions: yup
  //   .array()
  //   .of(
  //     yup.object({
  //       id: requiredString(1, 30),
  //       name: requiredString(),
  //       appType: requiredString(),
  //       category: requiredString(),
  //       // isChecked: yup.boolean().default(false),
  //     })
  //   )
  //   .default([]),
})
