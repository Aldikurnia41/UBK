import type { Roles } from '@/config'

interface UsersResponseDTO {
  ssoId: string
  username: string
  email: string
  fullname: string
  role: Roles | (string & {})
  profile: {
    typeAcc: string
    positions: string[]
    certificates?: {
      id: string
      path: string
      url: string
      name: string
    }[]
  }
}

interface UpdateUserPayload {
  fullName: string
  typeAcc: string
  role: string
  positions?: string[]
  certificates?: {
    // name: string
    path: string
  }[]
  acc: {
    username: string
    email: string
    password?: string
    password_confirmation?: string
  }
}

export type { UsersResponseDTO, UpdateUserPayload }
