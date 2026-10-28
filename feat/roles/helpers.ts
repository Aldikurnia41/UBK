export function adjustPermissionName(permissionName: string) {
  return permissionName
    .trim()
    .replace(/[-_]/g, ' ')
    .replace('can lihat', 'Lihat')
    .replace('can mengelola', 'Mengelola')
    .replace('can pendaftaran', 'Pendaftaran')
    .replace('can mengerjakan', 'Mengerjakan')
    .replace(/\s+/g, ' ')
}
