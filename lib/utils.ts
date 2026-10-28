import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { default as duration } from 'dayjs/plugin/duration'
import { default as customParseFormat } from 'dayjs/plugin/customParseFormat'
import { default as dayjs } from 'dayjs'
import { clsx } from 'clsx'
export * as yup from 'yup'
import 'dayjs/locale/id'

// Extends first
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.locale('id')

export const djs = dayjs

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateFormatter(date: Date, format: string) {
  return dayjs(date).format(format)
}

export function keys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}

export function strict<T extends object, X extends Extract<keyof T, string>>(obj: T, keys: X[]) {
  const s = {}

  for (const key in obj) {
    if (keys.some((k) => k === key)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      s[key] = obj[key]
    }
  }

  return s as { [P in X]: T[P] }
}

export function reversedEnum<T extends Record<string, string>, V extends T[keyof T]>(
  enumObj: T,
  value?: V | string
): {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T] {
  const entries = Object.entries(enumObj)
  const entry = entries.find(([, v]) => v === value)

  // Return the correct one. Or guarantee to return the first value
  return (!value || !entry ? entries : entry)[0] as never
}
