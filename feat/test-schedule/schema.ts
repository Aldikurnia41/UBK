import type { InferType } from 'yup'
import type { TestScheduleDetail, TestSchedulePayload } from '@/feat/test-schedule/dto'
import type { TestType } from '@/config'
import { djs, yup } from '@/lib/utils'
import { SCHEDULE_TYPE, TestType as TestTypeEnum, YupMessage } from '@/config'

/** Format nilai `<input type="datetime-local">` */
export const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm'

interface ScheduleRange {
  startAt: string
  endAt: string
}

export const testScheduleSchema = yup.object({
  batchId: yup.string().default('').required('Pilih diklat'),
  subjectId: yup.string().default('').required('Pilih materi'),
  testType: yup.string().default('').required('Pilih soal'),
  classroomId: yup
    .string()
    .default('')
    .when('testType', {
      is: (testType: string) => !!testType && testType !== TestTypeEnum.Pretest,
      then: (schema) => schema.required('Pilih kelas (wajib untuk Kuis & Posttest)'),
    }),
  startAt: yup
    .string()
    .default('')
    .required(YupMessage.Required)
    .test('valid', YupMessage.InvalidDate, (value) => djs(value).isValid()),
  endAt: yup
    .string()
    .default('')
    .required(YupMessage.Required)
    .test('valid', YupMessage.InvalidDate, (value) => djs(value).isValid())
    .test('after-start', 'Tanggal akhir harus setelah tanggal mulai', (value, ctx) =>
      djs(value).isAfter(djs((ctx.parent as ScheduleRange).startAt))
    )
    // schedule-test menyimpan satu `date` + jam mulai/akhir
    .test('same-day', 'Tanggal akhir harus di hari yang sama dengan tanggal mulai', (value, ctx) =>
      djs(value).isSame(djs((ctx.parent as ScheduleRange).startAt), 'day')
    ),
  duration: yup
    .string()
    .default('')
    .required(YupMessage.Required)
    .matches(/^\d+$/, YupMessage.Numeric)
    .test('min', 'Minimal 1 menit', (value) => Number(value) >= 1)
    .test('within-range', 'Durasi melebihi rentang tanggal mulai dan akhir', (value, ctx) => {
      const { startAt, endAt } = ctx.parent as ScheduleRange
      if (!djs(startAt).isValid() || !djs(endAt).isValid()) return true
      return Number(value) <= djs(endAt).diff(djs(startAt), 'minute')
    }),
})

export type TestScheduleValues = InferType<typeof testScheduleSchema>

export const toTestScheduleValues = (detail?: TestScheduleDetail | null): TestScheduleValues =>
  detail
    ? {
        batchId: detail.batchId,
        subjectId: detail.subjectId,
        testType: detail.testType ?? '',
        classroomId: detail.classroomId,
        startAt: djs(detail.startAt).format(DATETIME_LOCAL_FORMAT),
        endAt: djs(detail.endAt).format(DATETIME_LOCAL_FORMAT),
        duration: `${detail.duration}`,
      }
    : testScheduleSchema.getDefault()

export const toTestSchedulePayload = (value: TestScheduleValues): TestSchedulePayload => ({
  batchId: Number(value.batchId),
  ...(value.testType !== TestTypeEnum.Pretest &&
    value.classroomId && { classroomId: Number(value.classroomId) }),
  subjectId: Number(value.subjectId),
  type: SCHEDULE_TYPE[value.testType as TestType],
  date: djs(value.startAt).format('YYYY-MM-DD'),
  startTime: djs(value.startAt).format('HH:mm'),
  endTime: djs(value.endAt).format('HH:mm'),
})
