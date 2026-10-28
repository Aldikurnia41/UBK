import { QUESTION_FORM_OPTIONS, QuestionForm } from '@/config'

export const FORM_OPTIONS = QUESTION_FORM_OPTIONS.map((val) => ({
  label: val.label,
  value: +val.value,
}))

export const getFormId = (label: string) => FORM_OPTIONS.find((e) => e.label === label)?.value
const STRUCTURE_A = getFormId(QuestionForm.STRUCTURE_A)
const STRUCTURE_B = getFormId(QuestionForm.STRUCTURE_B)
const STRUCTURE_C = getFormId(QuestionForm.STRUCTURE_C)
const STRUCTURE_D = getFormId(QuestionForm.STRUCTURE_D)
const ESSAY_A = getFormId(QuestionForm.ESSAY_A)
const LISTENING_A = getFormId(QuestionForm.LISTENING_A)
const LISTENING_B = getFormId(QuestionForm.LISTENING_B)

const MARKED_KEY = (pathname: string) => `marked_questions_${pathname}`
const LAST_NUMBER = (pathname: string) => `last_number_${pathname}`
const CURRENT_NUMBER = (pathname: string) => `current_number_${pathname}`

const POPUP_ATTRIBUTE = {
  next: {
    title: 'Pindah ke Tipe Pertanyaan Selanjutnya?',
    desc: 'Setelah masuk ke tipe pertanyaan berikutnya, kamu tidak akan bisa membuka, melihat, atau membaca kembali semua pertanyaan di tipe pertanyaan ini. Pastikan tidak ada soal yang terlewat.',
    button: {
      cancel: 'Tidak, Batalkan',
      continue: 'Ya, Lanjut',
    },
  },
  unanswered_next: {
    title: 'Masih Ada Soal Belum Terisi!',
    desc: 'Kamu belum menjawab %q soal di Tipe Soal ini. Jika kamu melanjutkan ke Tipe Soal berikutnya, Tipe Soal saat ini akan dikunci secara permanen. Kamu tidak akan bisa kembali untuk melihat atau melengkapi soal yang kosong.',
    button: {
      cancel: 'Tidak, Batalkan',
      continue: 'Ya, Lanjut',
    },
  },
  finish: {
    title: 'Selesaikan %t Sekarang?',
    desc: 'Pastikan kamu telah menjawab seluruh soal dengan lengkap. Setelah diklik, semua jawaban akan dikirim ke sistem untuk dinilai dan tidak dapat diubah kembali.',
    button: {
      cancel: 'Periksa Kembali',
      continue: 'Ya, Selesaikan %t',
    },
  },
  browser_back: {
    title: 'Yakin Ingin Keluar dari UBK?',
    desc: 'Sisa waktu ujian akan tetap berjalan di background. Kamu bisa melanjutkan ujian ini kapan saja selama durasi masih tersedia.',
    button: {
      cancel: 'Tidak, Batalkan',
      continue: 'Ya, Lanjut',
    },
  },
}

export {
  STRUCTURE_A,
  STRUCTURE_B,
  STRUCTURE_C,
  STRUCTURE_D,
  ESSAY_A,
  LISTENING_A,
  LISTENING_B,
  MARKED_KEY,
  LAST_NUMBER,
  CURRENT_NUMBER,
  POPUP_ATTRIBUTE,
}
