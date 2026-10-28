'use client'

import type { RolesResponseDTO } from '@/feat/roles/dto'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import {
  toast,
  Checkbox,
  Input,
  Button,
  FieldSet,
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  Spinner,
} from '@sisfo-remake/ui'
import { cn } from '@/lib/utils'
import { rolesSchema } from '@/feat/roles/schema'
import { adjustPermissionName } from '@/feat/roles/helpers'
import { ButtonCancel } from '@/feat/roles/components/button-cancel'
import { createRoles, updateRoles } from '@/feat/roles/api'
import { MESSAGE } from '@/config'

interface FormRolesProps {
  readonly?: boolean
  role: RolesResponseDTO
}

export const RoleClient: React.FC<FormRolesProps> = ({ readonly = false, role }) => {
  const { id, name, allPermission: permissions } = role
  const isEdit = !!id
  const successMessage = isEdit ? MESSAGE.SUCCESS_UPDATE : MESSAGE.SUCCESS_CREATE
  const errorMessage = isEdit ? MESSAGE.ERROR_UPDATE : MESSAGE.ERROR_CREATE
  const categories = Array.from(new Set(permissions.map((perm) => perm.category)))
  const sortedCategories = [...categories].sort((a, b) => b.localeCompare(a))
  const router = useRouter()
  const form = useForm({
    validators: { onSubmitAsync: rolesSchema },
    defaultValues: {
      role: name,
      permissions: permissions
        .filter(({ isChecked }) => isChecked)
        .map((permission) => permission.id),
    },
    onSubmit: async ({ value }) => {
      const { error } = !id ? await createRoles(value) : await updateRoles(id, value)

      if (error) {
        return toast.error(error.message ?? errorMessage)
      }

      router.back()
      toast.success(successMessage)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldSet className='gap-6'>
        <FieldGroup className='gap-1.5'>
          <FieldLabel htmlFor='role' className='gap-0'>
            Peran{!readonly && <span className='text-destructive'>*</span>}
          </FieldLabel>
          <Field>
            <form.Field name='role'>
              {(field) =>
                readonly ? (
                  <p>{name || '-'}</p>
                ) : (
                  <FieldGroup className='gap-1.5'>
                    <Input
                      id={field.name}
                      name={field.name}
                      type='text'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Nama Peran'
                      aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldGroup>
                )
              }
            </form.Field>
          </Field>
        </FieldGroup>

        <FieldGroup className='gap-3'>
          <h2 className='font-semibold'>
            Permission{!readonly && <span className='text-destructive'>*</span>}
          </h2>
          <form.Field name='permissions'>
            {(field) => (
              <>
                {sortedCategories.map((category) => (
                  <Field key={category}>
                    <h3 className='font-semibold'>{category.replace('Mengelola', 'Edit')}</h3>
                    <div className='grid grid-cols-1 gap-3 @min-[555px]/field-group:grid-cols-2 @min-[1110px]/field-group:grid-cols-3'>
                      {permissions
                        .filter((permission) => permission.category === category)
                        .map((permission) => (
                          <div key={permission.id} className='flex items-center gap-x-2.5'>
                            <Checkbox
                              id={permission.id}
                              name={permission.name}
                              checked={field.state.value.includes(permission.id)}
                              disabled={
                                readonly ||
                                permissions
                                  .filter(({ id }) => field.state.value.includes(id))
                                  .some(({ restrict }) =>
                                    restrict.permissions.includes(permission.name)
                                  )
                              }
                              onCheckedChange={(value: boolean) => {
                                field.handleChange((prev) =>
                                  value
                                    ? Array.from(new Set([...prev, permission.id]))
                                    : prev.filter((permissionId) => permissionId !== permission.id)
                                )
                              }}
                            />
                            <label htmlFor={permission.id} className='capitalize'>
                              {adjustPermissionName(permission.name) || ''}
                            </label>
                          </div>
                        ))}
                    </div>
                  </Field>
                ))}
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </>
            )}
          </form.Field>
        </FieldGroup>
        {!readonly && (
          <div className='flex justify-end gap-2'>
            <form.Subscribe selector={(formState) => [formState.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type='button'
                  className={cn('relative bg-black text-white hover:bg-black/80')}
                  onClick={() => form.handleSubmit()}
                >
                  {isSubmitting && (
                    <Spinner className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                  )}
                  <span className={cn(isSubmitting ? 'opacity-0' : '') || void 0}>Simpan</span>
                </Button>
              )}
            </form.Subscribe>
            <ButtonCancel submit={() => form.reset()} />
          </div>
        )}
      </FieldSet>
    </form>
  )
}
