// Global type

export interface OptionValue {
  value: string
  label: string
}

export type QueryParams<T = unknown> = T & {
  page?: number
  limit?: number
  q?: string
}

export type PermissionKeys = 'canView' | 'canManage'

declare module '@tanstack/react-table' {
  interface TableState {
    canView?: boolean
    canManage?: boolean
  }
}
