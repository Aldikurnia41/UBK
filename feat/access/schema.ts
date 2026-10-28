import { yup } from '@/lib/utils'
import {
  optionalString,
  optionalStringMinMax,
  requiredString,
  requiredStringInArray,
  requiredStringOnlyAlphabet,
} from '@/lib/helpers'
import { YupMessage } from '@/config'

const certificateSchema = yup.object({
  url: requiredString(3, Infinity),
  path: requiredString(),
  id: optionalString(),
  name: optionalString(),
})

export const accessSchema = (isEdit: boolean) => {
  const certificatesSchema = yup
    .array()
    .of(certificateSchema)
    .default([])
    .when('positions', (value, schema) => {
      if (value.flat().includes('Assessor')) {
        return schema.min(1, 'Wajib diisi')
      }
      return schema
    })
  const confirmPasswordSchema = yup.string().when('password', {
    is: (password: string) => (password && password.length > 0) || !isEdit,
    then: (schema) =>
      schema.required(YupMessage.Required).oneOf([yup.ref('password')], 'Kata sandi tidak cocok'),
  })
  return yup.object({
    fullName: requiredStringOnlyAlphabet(4, 150),
    typeAcc: requiredString(1),
    role: requiredString(1),
    positions: yup
      .array()
      .default([])
      .when('role', {
        is: 'WI',
        then: () => requiredStringInArray(),
      }),
    certificates: certificatesSchema,
    acc: yup.object({
      username: requiredString(4, 30),
      email: requiredString(4, 30),
      password: isEdit ? optionalStringMinMax(6, 100) : requiredString(6, 100),
      password_confirmation: confirmPasswordSchema,
    }),
  })
}
