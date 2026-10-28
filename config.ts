import {
  ActivePassive,
  ClassType,
  ClothesSize,
  Degrees,
  Gender,
  Hair,
  LanguageProficiency,
  LeftOrRight,
  MaritalStatus,
  Matra,
  Profession,
  ProfileType,
  Qualification,
  Religion,
  Statuses,
  YesOrNo,
} from '@sisfo-remake/ui/enums'

export enum Routes {
  Login = '/masuk',
  Dashboard = '/dasbor',
  Calendar = '/kalender-akademik',
  TestSchedule = '/jadwal-tes',
  Assessment = '/penilaian',
  Result = '/hasil',
  QuestionBank = '/bank-soal',
  QuestionType = '/bentuk-soal',
  PretestQuestion = '/soal-pretest',
  PosttestQuestion = '/soal-posttest',
  QuizQuestion = '/soal-kuis',
  Management = '/manajemen/permission',
  Roles = `${Management}/peran`,
  Access = `${Management}/akses`,
  Test = '/tes',
  Notification = '/notifikasi',
}

export enum StatusExam {
  Past = 'Tutup',
  Present = 'Berlangsung',
  Future = 'Akan Datang',
}

export const variantStatus = {
  [StatusExam.Past]: 'warning-outline',
  [StatusExam.Present]: 'success-outline',
  [StatusExam.Future]: 'info-outline',
} as const

export enum StatusBatch {
  Unopened = 'unopened',
  Closed = 'closed',
  Ongoing = 'ongoing',
}

export enum CategorySchedule {
  kuis = 'kuis',
  ujian = 'ujian',
  Kuis = 'Kuis',
  Ujian = 'Ujian',
  UjianMasuk = 'Ujian Masuk',
  SeleksiKelas = 'Seleksi Kelas',
}

export enum RoutesApi {
  Auth = '/api/auth/',
  AuthLogout = '/api/logout',
  AuthProfile = '/profiles-me',
  KeycloackAuth = '/protocol/openid-connect/auth',
  KeycloakToken = '/protocol/openid-connect/token',
  KeycloakLogout = '/protocol/openid-connect/logout',
  Generator = '/profile-registrations/generate',
  Profiles = '/profiles',
  ExportProfileXlsx = '/profiles/export/xlsx',
  Subject = '/subjects',
  Batches = '/batches',
  Courses = '/courses',
  ClassRooms = '/classrooms',
  ClassType = '/class-type',
  ParentCourses = '/parent-courses',
  ScheduleTestList = '/schedules',
  ScheduleTestDetail = '/schedule',
  Students = '/classroom-students',
  // analytic (dashboard UBK milik instance Bahasa; lihat docs/backend-gap.md)
  Dashboard = '/bahasa/dashboard/ubk',
  ScheduleTestExport = '/schedules/export',
  Roles = '/roles',
  Access = '/accounts',
  Permissions = '/permissions',
  Worktest = '/work-test',
  WorktestSchedule = '/work-test/schedule',
  Participants = '/work-test/participant',
  VerifyWorktest = '/work-test/verify',
  AnswerScoreWorkTest = '/answer-scores/work-test',
  AnswerScoreBulk = '/answer-scores/bulk',
  Mess = '/inventories/mess',
  Notifications = '/notifications',
  QuestionType = '/form',
  QuestionTypes = '/forms',
  QuizQuestion = '/question',
  QuizQuestionCount = '/question/count-question',
  QuizQuestionSSE = '/api/sse/quiz-question',
  QuestionServed = '/serveQuestions',
  QuestionServedDetail = '/serveQuestion',
}

export enum Config {
  Title = 'UJI BERBASIS KOMPUTER',
  Subtitle = 'BADIKLAT KEMHAN PUSDIKLAT BELA NEGARA',
}

export const EventSourceName = {
  QuizQuestion: 'quiz-question',
  ExamQuestion: 'exam-question',
  QuizSchedule: 'schedule-test-quiz',
  ExamSchedule: 'schedule-test-exam',
}

/** Jenis tes pada UBK Bela Negara */
export enum TestType {
  Pretest = 'pretest',
  Posttest = 'posttest',
  Kuis = 'kuis',
}

export const TEST_TYPE_LABEL: Record<TestType, string> = {
  [TestType.Pretest]: 'Pretest',
  [TestType.Posttest]: 'Posttest',
  [TestType.Kuis]: 'Kuis',
}

export const TEST_TYPE_OPTIONS = Object.values(TestType).map((value) => ({
  value,
  label: TEST_TYPE_LABEL[value],
}))

/**
 * Backend UBK (schedule-test & question-bank) masih memakai tipe Bahasa. Pretest & Posttest
 * diperlakukan seperti ujian: Pretest = "Ujian Masuk" (sebelum diklat), Posttest = "Ujian".
 */
export const SCHEDULE_TYPE: Record<TestType, string> = {
  [TestType.Pretest]: 'Ujian Masuk',
  [TestType.Posttest]: 'Ujian',
  [TestType.Kuis]: 'Kuis',
}

/** `testType` bank soal di question-bank hanya mengenal `ujian` | `kuis` */
export const QUESTION_TEST_TYPE: Record<TestType, 'ujian' | 'kuis'> = {
  [TestType.Pretest]: 'ujian',
  [TestType.Posttest]: 'ujian',
  [TestType.Kuis]: 'kuis',
}

/** Tipe jadwal backend → tipe tes Belneg (`Seleksi Kelas` tidak dipakai Belneg) */
export const toTestType = (scheduleType?: string): TestType | undefined =>
  (Object.keys(SCHEDULE_TYPE) as TestType[]).find((key) => SCHEDULE_TYPE[key] === scheduleType)

/** Label tampilan tipe jadwal backend: `Ujian Masuk` → Pretest, `Ujian` → Posttest */
export const displayTestType = (scheduleType?: string) => {
  const testType = toTestType(scheduleType)
  return testType ? TEST_TYPE_LABEL[testType] : (scheduleType ?? '')
}

/** Label tampilan bentuk soal: nama bentuk soal Bahasa → Pilihan Ganda / Essay */
export const displayFormName = (name?: string) => {
  if (!name) return ''
  if (/essay/i.test(name)) return FormType.Essay
  if (/pilihan ganda/i.test(name)) return FormType.PilihanGanda
  return name
}

/** Seluruh tipe jadwal yang ditampilkan di UBK Belneg */
export const BELNEG_SCHEDULE_TYPES = Object.values(SCHEDULE_TYPE)

/** Bentuk soal pada UBK Bela Negara */
export enum FormType {
  PilihanGanda = 'Pilihan Ganda',
  Essay = 'Essay',
}

export const FORM_TYPE_OPTIONS = Object.values(FormType).map((value) => ({ value, label: value }))

/** Nilai minimal kelulusan (KKM) pada halaman Hasil */
export const PASSING_SCORE = 70

export enum Status {
  Active = 'Aktif',
  Passive = 'Pasif',
}

export enum StatusTest {
  NotStarted = 'Not Started',
  NotTaken = 'Not Taken',
  Working = 'Working',
  Finished = 'Finished',
}

export enum Roles {
  Admin = 'Admin',
  Siswa = 'Siswa',
  WI = 'WI',
  Pimpinan = 'Pimpinan',
  Superadmin = 'Superadmin',
  AdminProdik = 'Admin Prodik',
  AdminOpsdik = 'Admin Opsdik',
}

export const SSOConfig = {
  InstituteSelected: process.env.SSO_CONFIG_INSTITUTE ?? '',
  AppType: process.env.SSO_CONFIG_APP_TYPE ?? '',
  KeycloakId: process.env.KEYCLOAK_ID ?? '',
  KeycloakSecret: process.env.KEYCLOAK_SECRET ?? '',
  KeycloakIssuer: process.env.KEYCLOAK_ISSUER ?? '',
  ExpiredPermission: process.env.SSO_CONFIG_REVALIDATE ?? 30,
  PublicRoutes: [Routes.Login, RoutesApi.Auth],
  Instance: process.env.SSO_CONFIG_INSTANCE ?? '',
} as const

export const MESSAGE = {
  SUCCESS_CREATE: 'Berhasil menambah data',
  SUCCESS_UPDATE: 'Berhasil mengubah data',
  SUCCESS_DELETE: 'Berhasil menghapus data',

  ERROR_CREATE: 'Gagal menambah data',
  ERROR_UPDATE: 'Gagal mengubah data',
  ERROR_DELETE: 'Gagal menghapus data',

  ERROR_MAX_SCORE: 'Nilai melebihi maksimal (max: %q)',
  ERROR_MAX_QUESTION: 'Jumlah Pertanyaan melebihi maksimal (max: %q)',
  ERROR_MIN_FORMAT_QUESTION: 'Minimal 1 Format Pertanyaan',
} as const

export enum YupMessage {
  Required = 'Wajib diisi',
  Numeric = 'Hanya boleh diisi dengan angka',
  InvalidDate = 'Tanggal/waktu tidak valid',
  Min = 'Minimal %s karakter',
  Max = 'Maksimal %s karakter',
  Alphabet = 'Tidak boleh mengandung angka atau simbol',
}

export enum StatusVerify {
  Verified = 'verified',
  NotVerified = 'not verified',
}

export enum QuestionForm {
  STRUCTURE_A = 'Form Soal Bentuk Structure Tipe A (Soal Teks, Pilihan Ganda)',
  STRUCTURE_B = 'Form Soal Bentuk Structure Tipe B (Soal Teks dengan Gambar, Pilihan Ganda)',
  LISTENING_A = 'Form Soal Bentuk Listening Tipe A (Soal Listening, Pilihan Ganda)',
  LISTENING_B = 'Form Soal Bentuk Listening Tipe B (Soal Listening dengan Gambar, Pilihan Ganda)',
  STRUCTURE_C = 'Form Soal Bentuk Structure Tipe C (Menentukan Fungsi Kata (S, P, KW, O))',
  STRUCTURE_D = 'Form Soal Bentuk Structure Tipe D (Susun Kata)',
  ESSAY_A = 'Form Soal Bentuk Essay Tipe A (Pengisian Kata Ganti)',
}

export enum TokenStatus {
  Available = 'Token sudah tersedia. Silakan salin dan bagikan kepada peserta.',
  Unavailable = 'Token akan muncul secara otomatis 30 menit sebelum %t dimulai. Silakan cek kembali mendekati waktu pelaksanaan.',
}

export enum Grade {
  PreElementary = 'Pre-Elementary',
  Elementary = 'Elementary',
  PreIntermediate = 'Pre-Intermediate',
  Intermediate = 'Intermediate',
  PreAdvance = 'Pre-Advance',
  Advance = 'Advance',
}

// Enum Values
export const PROFILE_TYPE_VALUES = Object.values(ProfileType) as readonly ProfileType[]
export const STUDENT_STATUS_VALUES = Object.values(Statuses) as readonly Statuses[]
export const GENDER_VALUES = Object.values(Gender) as readonly Gender[]
export const RELIGION_VALUES = Object.values(Religion) as readonly Religion[]
export const CLOTHESSIZE_VALUES = Object.values(ClothesSize) as readonly ClothesSize[]
export const DEGREES_VALUES = Object.values(Degrees) as readonly Degrees[]
export const PROFESSION_VALUES = Object.values(Profession) as readonly Profession[]
export const MARITAL_STATUS_VALUES = Object.values(MaritalStatus) as readonly MaritalStatus[]
export const QUALIFICATION_VALUES = Object.values(Qualification) as readonly Qualification[]
export const HAIR_VALUES = Object.values(Hair) as readonly Hair[]
export const YES_OR_NO_VALUES = Object.values(YesOrNo) as readonly YesOrNo[]
export const LEFT_OR_RIGHT_VALUES = Object.values(LeftOrRight) as readonly LeftOrRight[]
export const LANGUAGE_PROFICIENCY_VALUES = Object.values(LanguageProficiency) as readonly LanguageProficiency[] // prettier-ignore
export const MATRA_VALUES = Object.values(Matra) as readonly Matra[]
export const CATEGORY_VALUES = Object.values(ClassType) as readonly ClassType[]
export const STATUS_VALUES = Object.values(ActivePassive) as readonly ActivePassive[]
export const QUESTION_FORM_VALUES = Object.values(QuestionForm) as readonly QuestionForm[]
export const GRADE_VALUES = Object.values(Grade) as readonly Grade[]
export const CATEGORY_SCHEDULE_VALUES = Object.values(
  CategorySchedule
) as readonly CategorySchedule[]

// Enum Options
export const PROFILE_TYPE_OPTIONS = PROFILE_TYPE_VALUES.map((value) => ({ label: value, value }))
export const STUDENT_STATUS_OPTIONS = STUDENT_STATUS_VALUES.map((value) => ({ label: value, value })) // prettier-ignore
export const GENDER_OPTIONS = GENDER_VALUES.map((value) => ({ label: value, value }))
export const RELIGION_OPTIONS = RELIGION_VALUES.map((value) => ({ label: value, value }))
export const CLOTHESSIZE_OPTIONS = CLOTHESSIZE_VALUES.map((value) => ({ label: value, value }))
export const DEGREES_OPTIONS = DEGREES_VALUES.map((value) => ({ label: value, value }))
export const PROFESSION_OPTIONS = PROFESSION_VALUES.map((value) => ({ label: value, value }))
export const MARITAL_STATUS_OPTIONS = MARITAL_STATUS_VALUES.map((value) => ({ label: value, value })) // prettier-ignore
export const QUALIFICATION_OPTIONS = QUALIFICATION_VALUES.map((value) => ({ label: value, value }))
export const HAIR_OPTIONS = HAIR_VALUES.map((value) => ({ label: value, value }))
export const YES_OR_NO_OPTIONS = YES_OR_NO_VALUES.map((value) => ({ label: value, value }))
export const LEFT_OR_RIGHT_OPTIONS = LEFT_OR_RIGHT_VALUES.map((value) => ({ label: value, value }))
export const LANGUAGE_PROFICIENCY_OPTIONS = LANGUAGE_PROFICIENCY_VALUES.map((value) => ({ label: value, value })) // prettier-ignore
export const MATRA_OPTIONS = MATRA_VALUES.map((value) => ({ label: value, value }))
export const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({ label: value, value }))
export const CATEGORY_OPTIONS = CATEGORY_VALUES.map((value) => ({ label: value, value }))
export const QUESTION_FORM_OPTIONS = QUESTION_FORM_VALUES.map((value, index) => ({
  label: value,
  value: index + 1 + '',
}))
export const GRADE_OPTIONS = GRADE_VALUES.map((value) => ({
  label: value,
  value,
}))
export const CATEGORY_SCHEDULE_OPTIONS = CATEGORY_SCHEDULE_VALUES.map((value) => ({
  label: value,
  value,
}))

export const TABLE_STYLES = {
  NUMBER_COLUMN: 'w-20 max-w-20 min-w-20',
  ACTION_COLUMN: 'w-25 max-w-25 min-w-25',
  CELL_MIN_WIDTH: 'min-w-50',
} as const

export const ABILITY = {
  TYPE: {
    READ: 'lihat',
    MANAGE: 'mengelola',
    WORKING: 'mengerjakan',
  },
  READ: {
    DASHBOARD: 'dashboard_ubk_bahasa',
    SCHEDULE: 'daftar_jadwal',
    QUESTION: 'daftar_pertanyaan',
    ASSESSMENT: 'daftar_penilaian',
    FORMTYPE: 'daftar_bentuk_soal',
    ACCESS: 'daftar_pengguna_pengelolaan_uji_komputer',
    ROLE: 'daftar_peran_pengelolaan_uji_komputer',
  },
  MANAGE: {
    SCHEDULE: 'jadwal',
    QUESTION: 'pertanyaan',
    ASSESSMENT: 'penilaian',
    FORMTYPE: 'bentuk_soal',
    ACCESS: 'daftar_pengguna_pengelolaan_uji_komputer',
    ROLE: 'daftar_peran_pengelolaan_uji_komputer',
  },
  WORKING: {
    TEST: 'test',
  },
}
