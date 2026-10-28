// Global helpers

import type { AxiosInstance } from 'axios'
import type { Pagination } from '@sisfo-remake/ui/types'
import { PureAbility } from '@casl/ability'
import { djs, yup } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { SSOConfig, YupMessage, StatusExam, ABILITY } from '@/config'

export function createAxiosInstance(
  axios: AxiosInstance,
  timeout = +SSOConfig.ExpiredPermission * 1000
) {
  const instance = {} as Record<keyof typeof apiEndpoint, AxiosInstance>
  const integrationApi = process.env.APP_API_INTEGRATION ?? ''
  const integrationBadiklat = process.env.APP_API_INTEGRATION_BADIKLAT ?? ''
  const apiEndpoint = {
    alumni: process.env.APP_API_ALUMNI ?? '',
    analytic: process.env.APP_API_ANALYTIC ?? '',
    assessment: process.env.APP_API_ASSESSMENT ?? '',
    assessmentCbt: process.env.APP_API_ASSESSMENT_UBK ?? process.env.APP_API_ASSESSMENT_CBT ?? '',
    assessments: process.env.APP_API_ASSESSMENTS ?? '',
    courses: process.env.APP_API_COURSES ?? '',
    evaluation: process.env.APP_API_EVALUATION ?? '',
    inventory: process.env.APP_API_INVENTORY ?? '',
    news: process.env.APP_API_NEWS ?? '',
    notification: process.env.APP_API_NOTIFICATION ?? '',
    profile: process.env.APP_API_PROFILE ?? '',
    rbac: process.env.APP_API_RBAC ?? '',
    schedule: process.env.APP_API_SCHEDULE ?? '',
    scheduleTest: process.env.APP_API_SCHEDULE_TEST ?? '',
    questionBank: process.env.APP_API_QUESTION_BANK ?? '',
    integrattion: process.env.APP_API_INTEGRATION ?? '',
  }

  for (const key in apiEndpoint) {
    const ref = key as keyof typeof apiEndpoint
    const baseURL =
      (['rbac', 'inventory', 'notification'].includes(key)
        ? integrationBadiklat
        : integrationApi) || apiEndpoint[ref]

    instance[ref] = axios.create({ baseURL, timeout })

    instance[ref].interceptors.request.use(async (request) => {
      const modules = await import('@/lib/auth')
      const session = await modules.auth()

      if (session?.access_token) {
        request.headers.Authorization = `Bearer ${session.access_token}`
        request.headers['institute-selected'] = SSOConfig.InstituteSelected
      }
      return request
    })
  }

  return instance
}

export function omitEmpty<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T

  for (const key in obj) {
    const value = obj[key]

    if (typeof value === 'object' && !Object.keys(value as never).length) {
      continue
    }

    if (value === '' || value == null || value == undefined) {
      continue
    }

    result[key] = value
  }

  return result
}

/** ================================= Time/Localization ==================================== */

export function dateToISO8601(date: Parameters<typeof djs>[0]) {
  return djs(date).format('YYYY-MM-DD')
}

/** ================================= Schema/Validator ===================================== */

export function testMinimum(min = 3) {
  return function (this: yup.TestContext<yup.AnyObject>, value?: string) {
    const v = value?.trim() ?? ''

    if (!v) {
      return this.createError({ message: YupMessage.Required })
    }

    if (v.length < min) {
      return this.createError({ message: YupMessage.Min.replace(/%s/g, min + '') })
    }

    return true
  }
}

export function testNumeric(min: number, max: number, allowFloat = false) {
  return function (this: yup.TestContext<yup.AnyObject>, value?: string) {
    const v = value?.trim() ?? ''

    if (!v) {
      return this.createError({ message: YupMessage.Required })
    }

    const floatRegex = /^\d+(\.\d+)?$/
    const intRegex = /^\d+$/

    if (allowFloat ? !floatRegex.test(v) : !intRegex.test(v)) {
      return this.createError({ message: YupMessage.Numeric })
    }

    const num = parseFloat(v)

    if (num < min) {
      return this.createError({
        message: YupMessage.Min.replace(/%s/g, min + '').replace(/ karakter/g, ''),
      })
    }

    if (num > max) {
      return this.createError({
        message: YupMessage.Max.replace(/%s/g, max + '').replace(/ karakter/g, ''),
      })
    }

    return true
  }
}

export function testNumericString(min: number, max: number, opt = false) {
  return function (this: yup.TestContext<yup.AnyObject>, value?: string) {
    const v = value?.trim() ?? ''

    if (!v) {
      if (opt) {
        return true // Empty is valid for optional fields
      }
      return this.createError({ message: YupMessage.Required })
    }

    if (!/^\d+$/.test(v)) {
      return this.createError({ message: YupMessage.Numeric })
    }

    if (v.length < min) {
      return this.createError({
        message: YupMessage.Min.replace(/%s/g, min + ''),
      })
    }

    if (v.length > max) {
      return this.createError({
        message: YupMessage.Max.replace(/%s/g, max + ''), // Should be Max, not Min
      })
    }

    return true
  }
}

export function requiredString(min = 3, max = 300) {
  return yup
    .string()
    .test('required-or-minimum', testMinimum(min))
    .max(max, YupMessage.Max.replace(/%s/g, max + ''))
    .default('')
}

export function requiredStringOnlyAlphabet(min = 3, max = 300) {
  return requiredString(min, max).matches(/^[A-Za-z\s]+$/, YupMessage.Alphabet)
}

export function requiredBoolean() {
  return yup.boolean().required(YupMessage.Required)
}

export function requiredStringInArray(min?: number, max?: number) {
  return yup.array().of(requiredString(min, max)).min(1, YupMessage.Required).default([])
}

export function requiredNumeric(min = 1, max = 3000) {
  return yup.string().test('numeric', testNumeric(min, max)).default('')
}

export function requiredFloat(min = 0.01, max = 3000) {
  return yup
    .string()
    .test('numeric', testNumeric(min, max, true))
    .default('')
}

export function requiredNumericalString(min = 1, max = 254) {
  return yup.string().test('numerical-string', testNumericString(min, max)).default('')
}

export function optionalNumericalString(min = 1, max = 254) {
  return yup
    .string()
    .optional()
    .test('numerical-string', testNumericString(min, max, true))
    .default(undefined)
}

export function requiredDate() {
  return yup
    .date()
    .transform((value: string | Date, originalValue) => (originalValue === '' ? null : value))
    .required(YupMessage.Required)
}

export function optionalString(max = 300) {
  return yup
    .string()
    .optional()
    .default('')
    .max(max, YupMessage.Max.replace(/%s/g, max + ''))
}

export function optionalStringMinMax(min = 3, max = 300) {
  return yup
    .string()
    .optional()
    .default('')
    .test(
      'min',
      YupMessage.Min.replace(/%s/g, min + ''),
      (val) => val.length >= min || val.length === 0
    )
    .max(max, YupMessage.Max.replace(/%s/g, max + ''))
}

export const getTargetPageAfterDelete = (currentPage: number, dataCount: number) => {
  if (dataCount === 1 && currentPage > 1) {
    return currentPage - 1
  }

  return currentPage
}

export function optionalStringInArray() {
  return yup.array().of(optionalString()).default([])
}

export function optionalDate() {
  return yup.date().nullable().optional().default(undefined)
}

export function toISOOrUndefined(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return djs(value).isValid() ? dateToISO8601(value) : void 0
  }
  return value instanceof Date ? dateToISO8601(value) : void 0
}

export function getValueByPath<T extends object>(path: string, obj: T): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = path
    .split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    .reduce<any>((acc, key) => acc?.[key], obj)

  return result == null ? '' : String(result)
}

export function isJSDateString(value: string): boolean {
  const jsDateRegex =
    /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/

  return jsDateRegex.test(value)
}

// DEVELOP USE
export async function mockPaginationData<T extends object>(
  data: T[],
  searchParams?: Pagination
): Promise<{
  page: number
  perPage: number
  total: number
  totalPages: number
  q?: string
  data: (T & { id: string })[]
}> {
  await new Promise((res) => setTimeout(res, 100))

  const currentPage = searchParams?.page && !isNaN(+searchParams.page) ? +searchParams.page : 1
  const currentLimit = searchParams?.perPage && !isNaN(+searchParams.perPage) ? +searchParams.perPage : 10 // prettier-ignore
  const currentSearch = searchParams?.q

  // Filter
  const filtered = Array.from({ length: 10 }, () => data)
    .flat()
    .filter((item) =>
      currentSearch && typeof (item as { name?: unknown }).name === 'string'
        ? ((item as { name: string }).name ?? '')
            .toLowerCase()
            .split(' ')
            .some((query) => query.startsWith(currentSearch.toLowerCase()))
        : true
    )

  // Remap
  const startIndex = (currentPage - 1) * currentLimit
  const endIndex = startIndex + currentLimit
  const remapped = filtered.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    id: `${startIndex + index + 1}`,
  }))

  return {
    q: currentSearch,
    page: currentPage,
    perPage: currentLimit,
    total: data.length ? filtered.length : -1,
    totalPages: Math.ceil(filtered.length / currentLimit),
    data: remapped,
  }
}

export const textNormalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase()

const shuffleCache = new Map<string, string[]>()
export const shuffleArray = (
  value: string,
  seed?: string,
  callback?: (shuffled: string[]) => void
) => {
  const values =
    typeof value === 'string' && value.trim().length > 0 ? value.trim().split(/\s+/g) : []

  if (values.length === 0) {
    if (callback) callback([])
    return []
  }

  const cacheKey = seed ?? value

  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]
  }

  shuffleCache.set(cacheKey, shuffled)

  if (callback) {
    callback(shuffled)
  }

  return shuffled
}

export const getStatus = (status: string) => {
  const capitalizeStatus = status.charAt(0).toUpperCase() + status.slice(1)
  const statusExam = StatusExam[capitalizeStatus as keyof typeof StatusExam]
  return statusExam
}

// =============================== COUNTDOWN ===============================

export interface CountdownState {
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

export function countdown(
  durationSeconds: number,
  onTick: (state: CountdownState) => void,
  intervalMs = 1000
): Promise<void> {
  return new Promise((resolve) => {
    let remaining = durationSeconds

    const toState = (secs: number): CountdownState => ({
      hours: Math.floor(secs / 3600),
      minutes: Math.floor((secs % 3600) / 60),
      seconds: secs % 60,
      finished: secs <= 0,
    })

    onTick(toState(remaining))

    const timer = setInterval(() => {
      remaining-- // decrement first
      const state = toState(remaining)
      onTick(state)

      if (state.finished) {
        clearInterval(timer)
        resolve()
      }
    }, intervalMs)
  })
}

export const pad = (n: number) => String(n).padStart(2, '0')

export function formatMinutesToHHMMSS(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// =============================== PERMISSION ABILITY ===============================
type PermissionModule =
  'dashboard' | 'schedule' | 'question' | 'assessment' | 'formtype' | 'access' | 'role' | 'worktest'

type PermissionAbility = Record<
  PermissionModule,
  {
    canRead: boolean
    canManage: boolean
    canWorking: boolean
  }
>
interface PermissionConfig {
  read?: string
  manage?: string
  working?: string
}

export const getPermissionAbility = async (): Promise<PermissionAbility> => {
  const session = await auth()
  const ability = new PureAbility(session?.permissions)
  const { TYPE, READ, MANAGE, WORKING } = ABILITY

  const createPermission = ({ read, manage, working }: PermissionConfig) => ({
    canRead: read ? ability.can(TYPE.READ, read) : false,
    canManage: manage ? ability.can(TYPE.MANAGE, manage) : false,
    canWorking: working ? ability.can(TYPE.WORKING, working) : false,
  })

  return {
    dashboard: createPermission({
      read: READ.DASHBOARD,
    }),

    schedule: createPermission({
      read: READ.SCHEDULE,
      manage: MANAGE.SCHEDULE,
    }),

    question: createPermission({
      read: READ.QUESTION,
      manage: MANAGE.QUESTION,
    }),

    assessment: createPermission({
      read: READ.ASSESSMENT,
      manage: MANAGE.ASSESSMENT,
    }),

    formtype: createPermission({
      read: READ.FORMTYPE,
      manage: MANAGE.FORMTYPE,
    }),

    access: createPermission({
      read: READ.ACCESS,
      manage: MANAGE.ACCESS,
    }),

    role: createPermission({
      read: READ.ROLE,
      manage: MANAGE.ROLE,
    }),

    worktest: createPermission({
      working: WORKING.TEST,
    }),
  }
}

/** SSE endpoint of the schedule-test service, or `''` when the service is not configured */
export const getEventSourceUrl = (baseUrl: string | undefined, eventName: string) =>
  baseUrl ? `${baseUrl}/sse/${eventName}` : ''
