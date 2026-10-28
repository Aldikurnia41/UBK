# Kebutuhan Backend — UBK Bela Negara

Frontend terhubung ke backend UBK yang ter-deploy (`*.10.70.0.45.nip.io`, instance Bahasa `ba`,
lewat Kong `APP_API_INTEGRATION`). Dokumen ini mencatat penyesuaian yang dilakukan FE agar alur
Belneg berjalan di backend tersebut, dan apa yang masih perlu ditambah di backend.

## Asumsi pemetaan tipe tes

Pretest & Posttest diperlakukan seperti ujian Bahasa, Kuis tetap kuis:

| Belneg | Jadwal (`schedule-test` `type`) | Bank soal (`question-bank` `testType`) |
| --- | --- | --- |
| Pretest | `Ujian Masuk` | `ujian` |
| Posttest | `Ujian` | `ujian` |
| Kuis | `Kuis` | `kuis` |

Diatur di `SCHEDULE_TYPE` / `QUESTION_TEST_TYPE` pada [config.ts](../config.ts). Backend menolak
nilai `pretest`/`posttest` (divalidasi Joi), jadi pemetaan ini diperlukan.

Bentuk soal: **Pilihan Ganda** = form nomor 1 (Structure Tipe A), **Essay** = form nomor 7
(Essay Tipe A) — `FORM_NUMBER` di [feat/question-set/dto.ts](../feat/question-set/dto.ts).

## Sudah berjalan dengan endpoint yang ada

| Fitur | Endpoint |
| --- | --- |
| Daftar/detail jadwal, filter Diklat (`batchId`), tipe, status, pencarian `q` | `GET /schedules`, `GET /schedule/:id` |
| Ekspor jadwal | `GET /schedules/export`, `GET /schedule/:id/export` |
| Tambah / ubah / hapus jadwal tes (lewat sesi jadwal akademik, lihat bawah) | `GET/POST /weekly-schedules`, `GET/PATCH/DELETE /weekly-schedule/:id`, `GET /session/:id` |
| Penilaian: daftar siswa, soal + jawaban, simpan nilai essay, hitung ulang | `GET /work-test/schedule/:id`, `GET /work-test/:id`, `GET /answer-scores/work-test/:id`, `POST /answer-scores/bulk`, `POST /work-test/:id/calculate` |
| Ekspor nilai | `GET /work-test/schedule/:id/export` |
| Bank soal: daftar, detail, tambah (banyak pertanyaan dikirim per butir), ubah | `GET/POST /question`, `GET/PUT /question/:id`, `GET /forms` |
| Dashboard admin: jumlah soal, rata-rata nilai per materi | `GET /question/count-question`, field `average` di `GET /schedules` |
| Jadwal Tes & Dashboard siswa, token, pengerjaan tes | `GET /schedules` (per siswa via Kong) + alur `/tes` Bahasa |
| Master Diklat / Materi | `GET /batches`, `GET /courses`, `GET /subjects?courseId=` |

## Penyesuaian di FE (perbedaan dengan Figma)

- **Soal = per pertanyaan.** question-bank tidak punya "set soal" bernama. Form tambah tetap bisa
  berisi banyak pertanyaan (dikirim satu per satu); edit/detail per pertanyaan. Field "Nama Soal"
  diganti **Diklat** + **Materi** (wajib di backend); kolom daftar menjadi "Pertanyaan".
- **Bobot soal tetap 1.** Backend menilai setiap butir 0–1 (nilai akhir 0–100 dihitung otomatis),
  jadi bobot essay yang bisa diisi di Figma belum didukung. Nilai essay diinput 0–1.
- **Soal Pretest & Soal Posttest berbagi bank soal `ujian`** — daftar dan jumlahnya sama.
- **Jadwal satu hari.** Jadwal menyimpan satu `date` + jam mulai/akhir, jadi Tanggal Mulai & Akhir
  harus di hari yang sama. Kolom "Soal" menampilkan tipe tes (mis. "Soal Pretest").
- **Bank soal tanpa ekspor** (dokumen pembanding #13).
- **Kirim Nilai** memakai `PATCH /schedule/:id/locked` (Kunci Nilai di Bahasa). Perpindahan
  Penilaian → Hasil mengikuti `isCalculated` dari backend, seperti Bahasa.

## Jadwal Tes = sesi jadwal akademik

`POST /schedule` tidak punya route di Kong ("no Route matched"). Jadwal tes di backend ini lahir
dari **sesi jadwal akademik** (service `schedule`), jadi form Jadwal Tes diterjemahkan oleh
[feat/test-schedule/weekly-schedule.ts](../feat/test-schedule/weekly-schedule.ts):

- **Tambah**: sesi kategori `Ujian Masuk`/`Ujian`/`Kuis` ditambahkan ke jadwal akademik angkatan
  pada tanggal itu (`PATCH`), atau jadwal akademik baru dibuat (`POST`). schedule-test lalu
  membuat jadwal tes + token otomatis.
- **Edit**: mengubah sesi tersebut. Tanggal/kelas hanya bisa diubah bila sesi itu satu-satunya di
  jadwal akademik hari itu. **Hapus**: membuang sesi (atau jadwal akademiknya bila tinggal satu).
- Aturan backend yang berlaku: sesi `Kuis` & `Ujian` (Posttest) **wajib kelas** (field Kelas
  muncul di form; angkatan tanpa kelas hanya bisa Pretest); setiap sesi memakai **1 JP** dari
  kuota jam pelajaran materi di kurikulum — bila kuota habis backend menolak ("Sisa jam
  Pelajaran ... 0"); sesi harus dimulai ≥ 5 menit dari sekarang; Author = pengguna yang membuat.
- Durasi pengerjaan di backend = selisih jam mulai–akhir; field Durasi hanya divalidasi ≤ rentang.
- Soal yang keluar di tes tetap perlu format soal (`POST /serveQuestion/:scheduleId`).

## Masih perlu dari backend

| Kebutuhan | Keterangan |
| --- | --- |
| Hapus pertanyaan | `DELETE /question/:id` belum ada di versi ter-deploy (ada di repo `main` terbaru). |
| Tipe `pretest`/`posttest` | Agar Soal Pretest & Posttest terpisah dan tidak meminjam tipe Ujian Masuk/Ujian. |
| Bobot per soal | Agar nilai essay bisa berbobot seperti di Figma. |
| Jam mulai/selesai pengerjaan | Kolom Jam Mulai/Selesai di Penilaian saat ini memakai `createdAt`/`updatedAt`. |
| Soal pada jadwal | Soal yang keluar di tes diatur lewat format soal (`POST /serveQuestion/:scheduleId`: bentuk soal, tingkat kesulitan, jumlah). Belum ada UI-nya di Belneg. |
| Dashboard Belneg | Analytic hanya punya `/bahasa/dashboard/ubk` (angkanya tidak sinkron dengan bank soal). |
| Izin (RBAC) | `SSO_CONFIG_APP_TYPE=ba-ubk` memakai izin Bahasa (`dashboard_ubk_bahasa`, dll.). |

## Catatan uji end-to-end (25 Sep 2026)

Diuji dengan akun admin dan 1 akun siswa hasil "Generate Akun" di server 10.70.0.45:

- Alur siswa berjalan: Dashboard → Jadwal Tes → token → penjelasan bentuk soal → Pilihan Ganda →
  Essay → selesai → "Sudah Dikerjakan". Admin: Penilaian → nilai essay → nilai akhir → Hasil (Lulus).
- **Pretest (Ujian Masuk) bisa diikuti calon siswa tanpa kelas.** Sesi `Kuis` dan `Ujian`
  (Posttest) di jadwal akademik **wajib `classroomId`**, jadi siswa harus sudah masuk kelas.
- **Penilaian → Hasil otomatis.** Begitu semua jawaban dinilai, backend mengisi
  `isCalculated: true` dan jadwal pindah ke Hasil — tombol "Kirim Nilai" (Figma) tidak sempat
  dipakai. Bila "Kirim Nilai" harus jadi langkah eksplisit, backend perlu menunda perpindahan itu.
- Akun hasil "Generate Akun" belum punya data `nasional`/`dikln`; NRP ditampilkan "-".
- Superadmin UBK tidak punya izin `mengelola_kursus_siswa`, jadi pendaftaran siswa ke kursus
  dilakukan lewat aplikasi akademik (untuk uji ini dipanggil langsung ke service `courses`).
