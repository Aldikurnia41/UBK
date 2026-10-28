import type { ExtractSubjectType, SubjectRawRule } from '@casl/ability'

export type CASLRules = SubjectRawRule<string, ExtractSubjectType<string>, unknown>

export interface RefreshTokenResponseDTO {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  refresh_token: string
  token_type: string
  scope: string
}

export interface Certificates {
  name: string
  path: string
  certificateUrl: string
}

export interface UserProfile {
  fullName: string
  typeAcc: string
  createdAt: string
  updatedAt: string
  certificates: Certificates[]
  verifState: string
  studentStatus: string
  avatarUrl: string | null
  authorName: string | null
  isMaried: boolean
  hasFamily: boolean
  hasCourseHistories: boolean
  hasCourseSurvey: boolean
  age: number | null
}

export interface Permission {
  id: string
  name: string
  appType: string
  category: string
  restrict: {
    permissions: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  appType: string
  createdAt: string
  updatedAt: string
  permissions: Permission[]
}

export interface Account {
  id: string
  username: string
  email: string
  no_telp: string
  instansi: string[]
  pre_role: string
  meta_properties: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
  ssoId: string
  roles: Role[]
}

export interface ProfileMeResponseDTO {
  ssoId: string
  instance: string
  profile: UserProfile
  createdAt: string
  updatedAt: string
  id: string
  acc: Account
}

// prettier-ignore
export interface AuthProfileDTO
  extends
  Pick<ProfileMeResponseDTO, 'id' | 'ssoId' | 'instance'>,
  Pick<ProfileMeResponseDTO['profile'], 'fullName' | 'typeAcc' | 'studentStatus'> {
  acc: Pick<ProfileMeResponseDTO['acc'], 'instansi' | 'pre_role' | 'meta_properties'>
}

export interface AuthDTO {
  access_token: string
  expires_at: number
  refresh_token: string
  profile: AuthProfileDTO
  expired_permissions: string
  active_instance: string
  roles: Pick<Role, 'id' | 'name' | 'appType'>[]
  permissions: CASLRules[]
  error: string | null
}

export interface RolePermission {
  id: string
  name: string
  appType: string
}

export interface RolesWithPermissions {
  roles: RolePermission[]
  permissions: RolePermission[]
}
