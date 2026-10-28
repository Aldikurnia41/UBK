import type { Pagination } from '@sisfo-remake/ui/types'
import type { OptionValue } from '@/type'
import type { TestScheduleResponse, TestScheduleRow } from '@/feat/test-schedule/dto'
import { djs } from '@/lib/utils'
import { formatMinutesToHHMMSS } from '@/lib/helpers'
import { toScheduleRow } from '@/feat/test-schedule/dto'
import { QUESTION_FORM_OPTIONS } from '@/config'

// PROFILE
export enum Type {
  Internasional = 'Internasional',
  Nasional = 'Nasional',
  DIKLN = 'DIKLN',
}
export interface AddressWithPhone {
  address: string
  phoneNumber: string
}
export interface BaseProfile {
  fullName: string
  placeOfBirth: string
  dateOfBirth: string
  address: string
  gender: string
  course: Course
  graduationDate: string
  homeAddress: AddressWithPhone
  officeAddress: AddressWithPhone
  nationality: string
  avatar: string | null
  authorId: string
  authorName: string | null
  avatarUrl: string | null
  registrationNumber?: string
}
export interface NasionalProfile {
  registrationNumber: string
  instansi: string
  position: string
  organizationUnit: string
  classRank: string
  classType: string
}
export interface InternasionalProfile {
  namePrefer: string
  qualification: string
  serviceNum: string
  unit: string
  stateOfOrigin: string
  passportNum: string
  service: string
  maritalStatus: string
  rank: string
  rankOffice: string
  presentPosition: string
  dateOfRank: string
  dateAssumedPosition: string
  militaryAddress: string
  branchArmedService: string
  branchArmed: string
  citizenship: string
  ethnicGroup: string
  titles: string
  highOrderDec: string
}
export type ProfileAlumni =
  | {
      profileType: Type.Nasional
      nasional: NasionalProfile
    }
  | {
      profileType: Type.DIKLN
      dikln: NasionalProfile
    }
  | {
      profileType: Type.Internasional
      internasional: InternasionalProfile
    }
export type Profile = BaseProfile & ProfileAlumni

export interface ParentCourse {
  id: number
  name: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  batchName: string
  parentCourseId: number
  grade: string
  desc: string
  createdAt: string
  updatedAt: string
  parentCourse: ParentCourse
}

export interface Batch {
  status: string
  id: number
  courseId: number
  name: string
  openDate: string
  closeDate: string
  createdAt: string
  updatedAt: string
  course: Course
}

export interface Certificate {
  path: string
  id: string
}

export interface ClassMasterProfile {
  fullName: string
  verifState: string
  authorId: string
  typeAcc: string
  positions: string[]
  certificates: Certificate[]
  createdAt: string
  updatedAt: string
  authorName: string
}

export interface ClassMaster {
  ssoId: string
  instance: string
  profile: ClassMasterProfile
  createdAt: string
  updatedAt: string
  id: string
}

export interface Classroom {
  id: number
  name: string
  batchId: number
  classMasterId: string
  minimalScore: number
  maxStudent: number
  createdAt: string
  updatedAt: string
  batch: Batch
  currentStudent: number
  remainingStudent: number
  classMaster: ClassMaster
}

export interface Schedule {
  id: number
  week: number
  date: string
  classroomId?: number
  batchId: number
  description: string
  createdAt: string
  updatedAt: string
  classroom?: Classroom
  batch: Batch
}

export interface Teacher {
  _id: string
  fullName: string
}

export interface Subject {
  id: number
  name: string
  code: string
  metaData?: null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: number
  scheduleId: number
  subjectId: number
  category: string
  startTime: string
  endTime: string
  teacherId: string
  room: string
  description: string
  teacher: Teacher
  schedule: Schedule
  subject: Subject
}
// ================================= QUIZ =================================

export interface QuizTestScheduleResponse {
  id: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string | null
  desc: string
  createdAt: string
  updatedAt: string
  status: string
  session: Session
  batch?: Batch
  playable: boolean
}

export interface QuizTestScheduleDetailResponse {
  id: number
  batchId: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string | null
  desc: string
  createdAt: string
  updatedAt: string
  status: string
  totalQuestions: number
  questionServeds: unknown[]
  session: Session
}

export interface QuizTestScheduleTable {
  id: number
  course: string
  class: string
  date: string
  token: string
  duration: number
  status: string
  startTime: string
  endTime: string
  playable: boolean
}

export interface QuizTestSchedule {
  id: number
  course: string
  class: string
  type: string
  question: string
  date: string
  duration: string
  total_questions: number
  class_master: string
  worktest_id: number
  token: string
}

export const quizTestScheduleTableDTO = (
  payload: Pagination<QuizTestScheduleResponse[]>
): Pagination<QuizTestScheduleTable[]> => {
  return {
    ...payload,
    data: payload.data.map((schedule) => ({
      id: schedule.id,
      course: `${schedule.batch?.course.batchName ?? ''} - ${schedule.batch?.name ?? ''}`,
      class: schedule.session.schedule.classroom?.name ?? '-',
      date: schedule.date ?? '-',
      duration: schedule.duration,
      token: schedule.token ?? '',
      status: schedule.status,
      startTime: schedule.startTime ?? '-',
      endTime: schedule.endTime ?? '-',
      playable: schedule.playable ?? false,
    })),
  }
}

export const quizTestScheduleDTO = (payload: QuizTestScheduleDetailResponse): QuizTestSchedule => {
  return {
    id: payload.id,
    course: `${payload.session.schedule.batch.course.batchName} - ${payload.session.schedule.batch.name}`,
    class: payload.session.schedule.classroom?.name ?? '-',
    type: payload.type,
    token: payload.token ?? '',
    question: payload.session.subject.name,
    date: djs(payload.date).format('D MMMM YYYY'),
    duration: `${payload.duration} Menit`,
    total_questions: payload.totalQuestions,
    class_master: payload.session.schedule.classroom?.classMaster.profile.fullName ?? '-',
    worktest_id: payload.id,
  }
}

// ================================= EXAM =================================

export interface ExamTestScheduleResponse {
  id: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string | null
  desc: string
  createdAt: string
  updatedAt: string
  status: string
  session: Session
  batch: Batch
  playable: boolean
}

export interface ExamTestScheduleDetailResponse {
  id: number
  batchId: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string | null
  desc: string
  createdAt: string
  updatedAt: string
  status: string
  totalQuestions: number
  questionServeds: unknown[]
  session: Session
}

export interface ExamTestScheduleTable {
  id: number
  course: string
  class: string
  date: string
  token: string
  duration: number
  status: string
  startTime: string
  endTime: string
  playable: boolean
}

export interface ExamTestSchedule {
  id: number
  course: string
  class: string
  type: string
  question: string
  date: string
  duration: string
  total_questions: number
  class_master: string
  worktest_id: number
}

export const examTestScheduleTableDTO = (
  payload: Pagination<ExamTestScheduleResponse[]>
): Pagination<ExamTestScheduleTable[]> => {
  return {
    ...payload,
    data: payload.data.map((schedule) => ({
      id: schedule.id,
      course: `${schedule.batch?.course.batchName} - ${schedule.batch?.name}`,
      class: schedule.session.schedule.classroom?.name ?? '-',
      date: schedule.date ?? '-',
      duration: schedule.duration,
      token: schedule.token ?? '',
      status: schedule.status,
      startTime: schedule.startTime ?? '-',
      endTime: schedule.endTime ?? '-',
      playable: schedule.playable ?? false,
    })),
  }
}

export const examTestScheduleDTO = (payload: ExamTestScheduleDetailResponse): ExamTestSchedule => {
  return {
    id: payload.id,
    course: `${payload.session.schedule.batch.course.batchName} - ${payload.session.schedule.batch.name}`,
    class: payload.session.schedule.classroom?.name ?? '-',
    type: payload.type,
    question: payload.session.subject.name,
    date: djs(payload.date).format('D MMMM YYYY'),
    duration: `${payload.duration} Menit`,
    total_questions: payload.totalQuestions,
    class_master: payload.session.schedule.classroom?.classMaster.profile.fullName ?? '-',
    worktest_id: payload.id,
  }
}

// ================================= WORKTEST ================================
export type Slot = {
  id: string
  value: string
  answer?: string
} | null

export interface Answer {
  id: string
  answer?: string
  value: string
}

export interface Question {
  id: string
  question: string
  displayQuestion: string
  difficulty: string
  courseId: number
  subjectId: number
  active: boolean
  formId: number
  formName: string
  testType: string
  authorId: string
  manualCorrect: boolean
  fileAudio: string | null
  fileImage: string | null
  answers: Answer[]
  answer: string | null | Slot[]
  createdAt: string
  updatedAt: string
}

export interface Form {
  id: number
  name: string
  description: string
  file: string
  questionForm: number
  createdAt: string
  updatedAt: string
}

export interface ScheduleTest {
  id: number
  batchId: number
  sessionId: number
  date: string
  dateStartTime: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string
  desc: string
  status: string
  totalQuestions: number
  isCalculated: boolean
  isLocked: boolean
  average: number
  createdAt: string
  updatedAt: string
}

export interface CurrentQuestionServed {
  id: number
  formId: number
  scheduleId: number
  duration: number | null
  durationLeft: number | null
  levelDifficult: string
  amount: number
  isQuestionServeStarting: boolean
  form: Form
  'schedule-test': ScheduleTest
  questions: Question[]
}

// summary entry inside schedule.questionServeds (no `questions` array, has `status`: "current" | "soon" | ...)
export interface QuestionServedSummary {
  id: number
  scheduleId: number
  formId: number
  duration: number | null
  levelDifficult: string
  amount: number
  createdAt: string
  updatedAt: string
  form: Form
  status: string
}

// nested weekly schedule inside session (distinct from top-level Schedule)
export interface ScheduleWeekly {
  id: number
  week: number
  date: string
  classroomId?: number
  batchId: number
  description: string
  createdAt: string
  updatedAt: string
  classroom?: Classroom
  batch: Batch
}

export interface SessionTest {
  id: number
  scheduleId: number
  subjectId: number
  duration: number
  status: string
  category: string
  startTime: string
  endTime: string
  numStartTime: number
  numEndTime: number
  teacherId: string
  room: string
  description: string
  totalStudent: number | null
  createdAt: string
  updatedAt: string
  schedule: ScheduleWeekly
  subject: Subject
}

export interface ScheduleWorktest {
  id: number
  batchId: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string
  desc: string
  status: string
  totalQuestions: number
  isCalculated: boolean
  isLocked: boolean
  isManualCorrection: boolean
  average: number
  createdAt: string
  updatedAt: string
  questionServeds: QuestionServedSummary[]
  session: SessionTest
}

export interface WorktestResponse {
  id: number
  score: number
  studentCourseId: number
  scheduleId: number
  courseId: number
  subjectId: number
  status: string
  isCalculated: boolean
  statusVerify: string
  createdAt: string
  updatedAt: string
  isLastQuestionServed: boolean
  currentQuestionServed: CurrentQuestionServed
  schedule: ScheduleWorktest
}

export interface FormattedQuestion {
  id: string
  question: string
  audio: string
  image: string
  answers: {
    value: string
    answer?: string
    id: string
  }[]
  answer?: string | Slot[]
}

export interface Worktest {
  id: number
  amountQuestion: number
  isLast: boolean
  form: {
    id: number
    name: string
    description: string
    file: string
  }
  schedule: {
    id: number
    start: string
    end: string
    duration: number
    remainingDuration: number
    total: number
    type: string
    course: string
    class: string
  }
  questions: FormattedQuestion[]
}

export const worktestDTO = (payload: WorktestResponse): Worktest => {
  const schedule = payload.currentQuestionServed['schedule-test']
  const endTime = djs(`${schedule.date} ${schedule.endTime}`)
  const questions = payload.currentQuestionServed.questions.map((question) => ({
    id: question.id,
    question: question.question,
    audio: question.fileAudio ?? '',
    image: question.fileImage ?? '',
    answers: question.answers,
    answer: question.answer ?? '',
  }))

  return {
    id: payload.id,
    amountQuestion: payload.currentQuestionServed.amount,
    isLast: payload.isLastQuestionServed,
    form: {
      id: payload.currentQuestionServed.form.questionForm,
      name: payload.currentQuestionServed.form.name,
      description: payload.currentQuestionServed.form.description,
      file: payload.currentQuestionServed.form.file,
    },
    schedule: {
      id: schedule.id,
      start: schedule.startTime,
      end: schedule.endTime,
      duration: schedule.duration,
      remainingDuration: endTime.diff(djs(), 'minute'),
      total: schedule.totalQuestions,
      type: schedule.type,
      course: `${payload.schedule.session.schedule.batch.course.batchName} - ${payload.schedule.session.schedule.batch.name}`,
      class: payload.schedule.session.schedule.classroom?.name ?? '',
    },
    questions,
  }
}

// ================================= FORMTEST ================================
export interface FormTestResponse {
  id: number
  name: string
  description: string
  file: string
  questionForm: {
    number: number
    text: string
  }
  createdAt: string
  updatedAt: string
}

export interface FormTestOptions extends OptionValue {
  id: number
}

export const formTestOptionsDTO = (payload: Pagination<FormTestResponse[]>): FormTestOptions[] => {
  return QUESTION_FORM_OPTIONS.map((form) => {
    const formType = payload.data.find((item) => `${item.questionForm.number}` === form.value)
    return {
      ...form,
      id: formType?.id ?? 0,
    }
  })
}

// ================================= RESULT ================================
export interface Duration {
  milliSecond: number
  second: number
  minute: number
  hour: number
}

export interface WorkTest {
  id: number
  score: number
  studentCourseId: number
  scheduleId: number
  courseId: number
  subjectId: number
  status: string
  isCalculated: boolean
  statusVerify: string
  createdAt: string
  updatedAt: string
}

export interface QuestionForm {
  id: number
  name: string
  description: string
  file: string
  questionForm: number
  createdAt: string
  updatedAt: string
}

export interface QuestionServed {
  id: number
  scheduleId: number
  formId: number
  duration: number | null
  levelDifficult: string
  amount: number
  createdAt: string
  updatedAt: string
  form: QuestionForm
}

export interface ScheduleBatch {
  status: string
  id: number
  courseId: number
  name: string
  openDate: string
  closeDate: string
  createdAt: string
  updatedAt: string
  course: Course
}

export interface ScheduleResultTest {
  id: number
  week: number
  date: string
  classroomId: number
  batchId: number
  description: string
  createdAt: string
  updatedAt: string
  batch: ScheduleBatch
}

export interface SessionResult extends Omit<Session, 'teacher'> {
  duration: number
  status: string
  numStartTime: number
  numEndTime: number
  totalStudent: number | null
  createdAt: string
  updatedAt: string
}

export interface ScheduleTestResult {
  isManualCorrection: boolean
  id: number
  batchId: number
  sessionId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  type: string
  token: string
  desc: string
  isCalculated: boolean
  isLocked: boolean
  average: number
  createdAt: string
  updatedAt: string
  status: string
  totalQuestions: number
  questionServeds: QuestionServed[]
  session: SessionResult
}

export interface Meta {
  workTest: WorkTest
  scheduleTest: ScheduleTestResult
}

export interface WorktestResultResponse {
  answered: number
  total: number
  type: string
  duration: Duration
  batch: Batch
  meta: Meta
}

export interface WorktestResult {
  course: string
  type: string
  answered: string
  duration: string
}

export const worktestResultDTO = (payload: WorktestResultResponse): WorktestResult => {
  return {
    course: `${payload.batch.course.batchName} - ${payload.batch.name}`,
    type: payload.meta.scheduleTest.type,
    answered: `${payload.answered}/${payload.meta.scheduleTest.totalQuestions} Soal Terjawab`,
    duration: formatMinutesToHHMMSS(payload.duration.minute),
  }
}

// ================================= STUDENT PROFILE ================================
export interface StudentProfileResponse {
  id: string
  ssoId: string
  instance: string
  profile: Profile
  createdAt: string
  updatedAt: string
}

export interface StudentProfile {
  id: string
  fullName: string
  registrationNumber: string
}

export const studentProfileDTO = (payload: StudentProfileResponse): StudentProfile => {
  const { profile } = payload

  // Akun hasil "Generate Akun" belum punya data per tipe profil sampai siswa melengkapinya
  const getRegistrationNumber = (): string => {
    switch (profile.profileType) {
      case Type.Nasional:
        return (profile.nasional as typeof profile.nasional | undefined)?.registrationNumber ?? '-'
      case Type.DIKLN:
        return (profile.dikln as typeof profile.dikln | undefined)?.registrationNumber ?? '-'
      case Type.Internasional:
        return (
          (profile.internasional as typeof profile.internasional | undefined)?.serviceNum ?? '-'
        )
      default:
        return '-'
    }
  }

  return {
    id: payload.id,
    fullName: profile.fullName ?? '',
    registrationNumber: getRegistrationNumber(),
  }
}

// ===================== Jadwal Tes siswa (Belneg) =====================
export interface StudentTestScheduleResponse extends TestScheduleResponse {
  /** `false` bila siswa sudah mengerjakan tes ini */
  playable?: boolean
}

export interface StudentTestSchedule extends TestScheduleRow {
  token: string
  status: TestScheduleResponse['status']
  /** Tombol "Kerjakan Tes" aktif: jadwal berlangsung & belum dikerjakan */
  canStart: boolean
  isDone: boolean
}

export const studentTestScheduleDTO = (
  payload: Pagination<StudentTestScheduleResponse[]>
): Pagination<StudentTestSchedule[]> => ({
  ...payload,
  data: payload.data.map((item) => ({
    ...toScheduleRow(item),
    token: item.token ?? '',
    status: item.status,
    canStart: item.status === 'present' && item.playable !== false,
    isDone: item.status !== 'future' && item.playable === false,
  })),
})
