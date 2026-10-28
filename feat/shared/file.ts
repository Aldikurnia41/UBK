import type { AxiosResponse } from 'axios'

/** Serializable file payload returned by export server actions */
export interface ExportFile {
  base64: string
  filename: string
  contentType: string
}

/** Converts an `arraybuffer` axios response into a payload a server action can return */
export function toExportFile(response: AxiosResponse<ArrayBuffer>, fallbackName: string) {
  const disposition = String(response.headers['content-disposition'] ?? '')
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName
  const contentType = String(
    response.headers['content-type'] ??
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )

  return {
    base64: Buffer.from(response.data).toString('base64'),
    filename,
    contentType,
  } satisfies ExportFile
}

/** Browser-side: triggers a download from an `ExportFile` */
export function downloadExportFile({ base64, filename, contentType }: ExportFile) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([bytes], { type: contentType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
