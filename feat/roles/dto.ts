export interface RolesDTO {
  id: string
  name: string
}

export interface PermissionResponseDTO {
  id: string
  name: string
  appType: string
  category: string
  isChecked: boolean
  restrict: {
    permissions: string[]
  }
}

export interface RolesResponseDTO {
  id: string
  name: string
  role: string
  permissions: PermissionResponseDTO[]
  allPermission: PermissionResponseDTO[]
}

export interface RolesPayloadDTO {
  role: string
  appType: string
  permissions: string[]
}
