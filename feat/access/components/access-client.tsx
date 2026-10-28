'use client'

import type { RolesDTO } from '@/feat/roles/dto'
import type { UsersResponseDTO } from '@/feat/access/dto'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { toast, FormField } from '@sisfo-remake/ui'
import { accessSchema } from '@/feat/access/schema'
import { createUser, updateUser, uploadCertificate } from '@/feat/access/api'
import { MESSAGE, Roles } from '@/config'

export interface AccessFormProps {
  readonly?: boolean
  user: UsersResponseDTO
  roles: RolesDTO[]
  isSuperadmin?: boolean
}

export const AccessClient: React.FC<AccessFormProps> = ({
  readonly = false,
  user,
  roles,
  isSuperadmin = false,
}) => {
  const isEdit = !!user.ssoId
  const successMessage = isEdit ? MESSAGE.SUCCESS_UPDATE : MESSAGE.SUCCESS_CREATE
  const errorMessage = isEdit ? MESSAGE.ERROR_UPDATE : MESSAGE.ERROR_CREATE
  const { fullname: fullName, role, profile, email, username } = user
  const { certificates: profileCertif = [], positions } = profile
  const [showSubrole, setShowSubrole] = useState(role === Roles.WI)
  const [showCertificate, setShowCertificate] = useState(!!profileCertif?.length)
  const router = useRouter()
  const wiStudent = { [Roles.Siswa]: 'siswa', [Roles.WI]: 'wi' }
  const typeAcc = role in wiStudent ? wiStudent[role as keyof typeof wiStudent] : 'lainnya'
  const form = useForm({
    defaultValues: {
      fullName,
      typeAcc,
      role,
      positions,
      acc: {
        username,
        ...(email ? { email } : {}),
        ...('password' in user ? { password: '' } : {}),
        ...('password_confirmation' in user ? { password_confirmation: '' } : {}),
      },
      certificates: profileCertif.map((certificate) => ({
        url: certificate.url,
        path: certificate.path,
        id: certificate.id,
        name: certificate.name,
      })),
    },
    validators: readonly ? void 0 : { onSubmitAsync: accessSchema(isEdit) },
    // NOTE: DO NOT REMOVE THIS LOG. SINCE FILE UPLOAD STILL EXPERIMENTAL
    // REMOVE WHEN YOU GOT NO ERROR AND HAS STABLE UPLOAD FEATURE
    onSubmitInvalid: (e) => console.log(e.formApi.getAllErrors()),
    onSubmit: async ({ value }) => {
      const { fullName, typeAcc, role, positions, acc } = value
      const { username, password, password_confirmation } = acc
      const certificates = value.certificates.map(({ path, name, id }) => ({
        path,
        ...(profileCertif ? { name } : {}),
        ...(!id.includes('-') && isEdit ? { id } : {}),
      }))
      const isWI = role === Roles.WI
      const payload = {
        fullName,
        typeAcc,
        role,
        ...(isWI ? { certificates } : {}),
        ...(isWI ? { positions } : {}),
        acc: {
          username,
          email: acc.email ?? '',
          ...(password ? { password } : {}),
          ...(password_confirmation ? { password_confirmation } : {}),
        },
        positions, // BE specific required,
      }

      const { error } = !user.ssoId
        ? await createUser(payload)
        : await updateUser(user.ssoId, payload)

      if (error) {
        return toast.error(error.message ?? errorMessage)
      }

      router.back()
      toast.success(successMessage)
    },
  })

  return (
    <div>
      <FormField
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        form={form}
        groups={[
          {
            column: 1,
            fields: [
              {
                type: 'text',
                name: 'fullName',
                label: 'Nama Lengkap',
                required: true,
                placeholder: 'Nama Lengkap',
              },
              {
                type: 'text',
                name: 'acc.username',
                label: 'Nama Pengguna',
                required: true,
                placeholder: 'Nama Pengguna',
              },
              {
                type: 'text',
                name: 'profile.typeAcc',
                label: 'Nama Pengguna',
                required: true,
                placeholder: 'Nama Pengguna',
                hide: true,
              },
              {
                type: 'email',
                name: 'acc.email',
                label: 'Email',
                required: !email,
                placeholder: 'Email',
              },
              {
                type: 'password',
                name: 'acc.password',
                label: 'Kata Sandi',
                hide: readonly,
                required: !user.ssoId && !readonly,
                placeholder: 'Kata Sandi',
              },
              {
                type: 'password',
                name: 'acc.password_confirmation',
                label: 'Konfirmasi Kata Sandi',
                hide: readonly,
                required: !user.ssoId && !readonly,
                placeholder: 'Konfirmasi Kata Sandi',
              },
              {
                type: 'combobox',
                name: 'role',
                label: 'Peran',
                required: true,
                options:
                  // NOTE: Unless readonly, only superadmin can view superadmin option.
                  roles
                    .filter(({ name }) =>
                      isSuperadmin || readonly ? true : name !== Roles.Superadmin
                    )
                    .map(({ name }) => ({ value: name, label: name })),
                placeholder: 'Pilih Peran',
                listeners: {
                  onChange: ({ value }) => {
                    setShowSubrole(value === Roles.WI)

                    if (value !== Roles.WI) {
                      form.setFieldValue('positions', [])
                      form.setFieldValue('certificates', [])
                    }
                  },
                },
              },
              {
                type: 'checkbox',
                name: 'positions',
                label: 'Sub-Role',
                required: true,
                options: [
                  {
                    value: 'Assessor',
                    label: 'Penguji',
                  },
                  {
                    value: 'Class Master',
                    label: 'Class Master',
                  },
                ],
                hide: !showSubrole,
                listeners: {
                  onChange: ({ value }) => {
                    const isAssessor = (value as string[]).includes('Assessor')

                    setShowCertificate(isAssessor)
                    if (!isAssessor) {
                      form.setFieldValue('certificates', [])
                    }
                  },
                },
              },
              {
                type: 'files',
                name: 'certificates',
                required: true,
                label: 'Sertifikat Penguji',
                hide: !showCertificate,
                maxFilesSizeInMB: 20,
                inputProps: { multiple: true },
                onUploadFile: async (files) => {
                  const oldFiles = files.filter(({ file }) => !file)
                  const newFiles = files.filter(({ file }) => !!file)
                  const { data: newCertificates, error } = await uploadCertificate(
                    Array.from(newFiles.map(({ file }) => file).filter(Boolean))
                  )

                  if (error) {
                    throw new Error(error.message)
                  }

                  const newFilesWithPath = newFiles.map(({ id, name, url }, index) => ({
                    id,
                    name,
                    url,
                    path: newCertificates[index]?.path ?? '',
                  }))

                  return [...oldFiles, ...newFilesWithPath]
                },
              },
            ],
          },
        ]}
        submit={{ children: 'Simpan' }}
        cancel={{
          children: 'Batal',
          onClick: () => {
            form.reset()
            setShowCertificate(form.getFieldValue('positions').includes('Assessor'))
            setShowSubrole(form.getFieldValue('role') === Roles.WI)
          },
        }}
      />
    </div>
  )
}
