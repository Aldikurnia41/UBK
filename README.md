# Sisfo Bela Negara — Uji Berbasis Komputer (UBK)

Aplikasi admin UBK Pusdiklat Bela Negara (Badiklat Kemhan). Dibangun dari base **Sisfo Bahasa UBK**
(`@sisfo-remake/bahasa-ubk`) dengan komponen **Sisfo UI** (`@sisfo-remake/ui`, vendored di `vendor/`),
dan disesuaikan dengan desain Figma _2024 Sisfo Bela Negara Remake_ serta dokumen pembanding
_Comparison UBK Belneg & UBK Bahasa_.

## Menjalankan

```bash
pnpm install
cp .env.example .env   # isi konfigurasi Keycloak & URL backend
pnpm dev --hostname 0.0.0.0   # --hostname agar bisa diakses dari LAN
```

Login selalu lewat SSO Keycloak (tidak ada bypass). Untuk akses via IP LAN, set `AUTH_URL`,
`KEYCLOAK_REDIRECT_URI`, dan `APP_ALLOWED_DEV_ORIGINS` ke alamat tersebut.

## Struktur menu

| Menu | Route | Catatan |
| --- | --- | --- |
| Dashboard | `/dasbor` | Kartu jumlah soal Pretest/Posttest/Kuis, grafik rata-rata nilai per Mata Diklat (filter tahun), tabel Jadwal Test seluruh tipe |
| Kalender | `/kalender-akademik` | Sama dengan Bahasa |
| Bank Soal › Bentuk Soal | `/bank-soal/bentuk-soal` | Template Bahasa: search, detail & edit (tanpa tambah/hapus/ekspor) |
| Bank Soal › Soal Pretest / Posttest / Kuis | `/bank-soal/soal-{pretest,posttest,kuis}` | CRUD + ekspor + filter; form **multiple pertanyaan** dalam satu form |
| Jadwal Tes | `/jadwal-tes` | CRUD + ekspor + filter; satu tabel untuk semua tipe tes; token pada detail |
| Penilaian | `/penilaian` | Jadwal yang sudah selesai & belum dikirim → Daftar Siswa → Nilai. PG otomatis & terkunci, Essay diinput admin. "Kirim Nilai" memindahkan jadwal ke Hasil |
| Hasil | `/hasil` | Daftar jadwal yang nilainya sudah dikirim → Daftar Siswa (nilai akhir + Lulus/Belum Lulus, KKM `PASSING_SCORE`) |
| Manajemen Akun | `/manajemen/permission/{peran,akses}` | Sama dengan Bahasa |
| Jadwal Tes (siswa) | `/tes` | Pretest, Posttest & Kuis dalam satu tabel → "Kerjakan Tes" → token → pengerjaan `/tes/[scheduleId]` |

Menu **Manajemen Kuis**, **Manajemen Ujian**, dan **Tes Saya** dari Bahasa dihapus. Siswa melihat
Dashboard, Kalender, dan Jadwal Tes (sesuai Figma sidebar siswa); halaman pengerjaan tes memakai
alur Bahasa.

## Backend

Terhubung ke backend UBK yang ter-deploy. Pretest dipetakan ke tipe `Ujian Masuk`, Posttest ke
`Ujian`, Kuis ke `Kuis` (lihat `SCHEDULE_TYPE` di `config.ts`). Endpoint yang dipakai, penyesuaian
terhadap Figma, dan kebutuhan backend yang belum ada dirinci di
[docs/backend-gap.md](docs/backend-gap.md).

## Struktur kode

```
feat/
  question-set/   Bank Soal Pretest/Posttest/Kuis (api, dto, schema, form, detail)
  test-schedule/  Jadwal Tes
  assessment/     Penilaian & Hasil
  dashboard/      Dashboard & grafik
  shared/         Opsi Diklat/Materi, util ekspor, InfoList, CancelButton
  test/           Jadwal Tes siswa & pengerjaan tes (dari Bahasa)
columns/          Definisi kolom TableView
```
