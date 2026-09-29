# Struktur Project: Next.js + Supabase + Prisma

Pasangan dari `PRD-SPG-Usher-App.md` (v0.7) dan `prisma/schema.prisma`.

## 1. Struktur Folder

```
spg-app/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                    # akun admin pertama + AppSetting default
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx             # landing
│  │  │  ├─ login/page.tsx
│  │  │  └─ register/page.tsx
│  │  ├─ (talent)/
│  │  │  ├─ dashboard/page.tsx   # status verifikasi, lamaran, event hari ini
│  │  │  ├─ profile/page.tsx     # data diri
│  │  │  ├─ verification/page.tsx# wizard: KTP -> selfie -> video -> submit
│  │  │  ├─ events/page.tsx      # daftar lowongan
│  │  │  ├─ events/[id]/page.tsx # detail + tombol apply
│  │  │  └─ attendance/[applicationId]/page.tsx  # check-in / check-out
│  │  ├─ (admin)/admin/
│  │  │  ├─ page.tsx             # dashboard ringkasan
│  │  │  ├─ reviews/page.tsx     # antrean review pendaftar
│  │  │  ├─ reviews/[id]/page.tsx# detail: data, KTP, selfie, video, skor, approve/reject
│  │  │  ├─ talents/page.tsx     # daftar talent + filter
│  │  │  ├─ events/page.tsx
│  │  │  ├─ events/new/page.tsx
│  │  │  ├─ events/[id]/page.tsx # pelamar: shortlist, konfirmasi
│  │  │  ├─ events/[id]/attendance/page.tsx  # absensi live + koreksi
│  │  │  ├─ reports/page.tsx     # rekap + export Excel/CSV
│  │  │  └─ settings/page.tsx    # threshold face match, radius default
│  │  ├─ api/
│  │  │  ├─ upload/sign/route.ts        # signed upload URL (validasi tipe & ukuran)
│  │  │  ├─ verification/finalize/route.ts  # jalankan pengecekan otomatis setelah upload
│  │  │  ├─ attendance/route.ts         # submit absensi
│  │  │  └─ reports/export/route.ts     # generate xlsx/csv
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ ui/                     # shadcn/ui
│  │  ├─ forms/                  # RegisterForm, ProfileForm, EventForm
│  │  ├─ upload/                 # ImageUploader, VideoUploader (preview + validasi klien)
│  │  ├─ admin/                  # ReviewPanel, VideoPlayer, ScoreBadge, AttendanceTable
│  │  └─ attendance/             # CheckInCard (GPS + selfie)
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ supabase/{server,client,admin}.ts
│  │  ├─ auth.ts                 # getSession(), requireRole("ADMIN" | "TALENT")
│  │  ├─ crypto.ts               # encryptNik(), hashNik() (AES-256-GCM + HMAC)
│  │  ├─ nik.ts                  # validasi struktur NIK 16 digit
│  │  ├─ face.ts                 # AWS Rekognition: compareFaces(), detectFaces()
│  │  ├─ geo.ts                  # haversine distance, cek geofence
│  │  ├─ exif.ts                 # baca waktu ambil foto (exifr)
│  │  ├─ storage.ts              # signed URL upload/download, aturan path
│  │  ├─ audit.ts                # logAudit(actor, action, target)
│  │  ├─ settings.ts             # baca AppSetting (dengan cache)
│  │  └─ email.ts                # Resend
│  ├─ server/actions/            # Server Actions
│  │  ├─ auth.ts  talent.ts  verification.ts
│  │  ├─ events.ts  applications.ts  attendance.ts  admin.ts
│  ├─ validations/               # skema zod (profil, event, upload)
│  ├─ emails/                    # template email (hasil review, konfirmasi, pengingat)
│  └─ middleware.ts              # cek sesi + role per route group
├─ .env.example
└─ package.json
```

## 2. Setup Awal

```bash
npx create-next-app@latest spg-app --typescript --tailwind --eslint --app --src-dir
cd spg-app

npm i @prisma/client @supabase/supabase-js @supabase/ssr zod \
      react-hook-form @hookform/resolvers @aws-sdk/client-rekognition \
      resend exifr date-fns xlsx
npm i -D prisma

npx shadcn@latest init
npx prisma init            # lalu ganti isi schema.prisma dengan file yang sudah dibuat
npx prisma migrate dev --name init
```

## 3. Environment Variables (`.env.example`)

```
DATABASE_URL=            # Supabase pooled connection
DIRECT_URL=              # Supabase direct connection (migrasi)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # hanya di server, jangan pernah ke klien

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

NIK_ENCRYPTION_KEY=      # 32 byte (base64) untuk AES-256-GCM
NIK_HASH_PEPPER=         # rahasia untuk HMAC hash NIK

RESEND_API_KEY=
APP_URL=
```

## 4. Storage (Supabase, semua bucket privat)

| Bucket | Isi | Batas | Akses |
|---|---|---|---|
| `ktp` | foto KTP | JPG/PNG, 1-5 MB | admin saja |
| `selfies` | selfie registrasi | JPG/PNG, 1-5 MB | admin saja |
| `videos` | video casting + frame | MP4/MOV 2-20 MB, frame JPG | admin saja |
| `attendance` | selfie absensi | JPG/PNG, 1-5 MB | admin saja |

- Path: `{talentId}/{uuid}.{ext}`.
- Upload lewat **signed upload URL** yang dibuat server (server memvalidasi tipe dan ukuran sebelum memberi URL), langsung dari browser ke storage.
- Download hanya lewat **signed URL berumur pendek** yang dibuat server setelah cek role ADMIN, dan setiap akses dicatat di `AuditLog`.

## 5. Alur Verifikasi (teknis)

1. Talent mengisi data diri (server menyimpan NIK terenkripsi + hash; hash unik mencegah 1 NIK banyak akun).
2. Klien memvalidasi file (tipe, ukuran, portrait, durasi ±20 detik lewat `<video>` metadata) sebelum upload.
3. Klien mengambil 2-3 **frame JPEG** dari video (bagian perkenalan dan pose depan) dengan canvas, lalu mengunggahnya bersama video. Face match memakai frame ini, jadi tidak perlu FFmpeg di server.
4. Setelah semua file terunggah, klien memanggil `verification/finalize`. Server:
   - validasi struktur NIK dan konsistensi dengan data diri,
   - (opsional) OCR KTP,
   - Rekognition: KTP vs selfie, frame video vs selfie, cek jumlah wajah,
   - cek duplikat wajah antar akun,
   - simpan skor dan `flags`, status talent menjadi `PENDING_REVIEW`.
5. Admin membuka `reviews/[id]`, melihat semua bukti dan skor, lalu approve/reject. Keputusan tercatat di `Verification` dan `AuditLog`; talent menerima email.

Catatan: metadata video (durasi/resolusi) di MVP berasal dari klien, jadi diberi flag untuk admin dan bukan dianggap final. Jika nanti dibutuhkan validasi server-side, tambahkan worker kecil dengan ffprobe.

## 6. Alur Absensi (teknis)

1. Talent membuka `attendance/[applicationId]`. Halaman hanya aktif jika lamaran `CONFIRMED` dan waktu berada di rentang `startsAt - checkInOpensMinutesBefore` sampai `endsAt`.
2. Browser mengambil GPS (Geolocation API, wajib HTTPS), talent mengunggah selfie.
3. Server menghitung: `serverTimestamp`, jarak ke lokasi (haversine), keterlambatan (`isLate`), face match vs selfie terverifikasi, dan EXIF waktu foto.
4. Aturan status: jika dalam radius, match tinggi, dan EXIF wajar maka `VALID`; selain itu `NEEDS_REVIEW` beserta `flags`. Tidak ada penolakan otomatis.
5. Admin memantau live di `events/[id]/attendance` dan bisa koreksi dengan catatan (tercatat di `AuditLog`).

## 7. Kontrol Akses

- `middleware.ts` memblokir route berdasarkan role; setiap Server Action dan route handler tetap memanggil `requireRole()` (jangan hanya mengandalkan middleware).
- Prisma terhubung langsung ke database sehingga melewati RLS Supabase. Karena itu otorisasi ditegakkan di kode server. Sebagai lapisan tambahan, aktifkan RLS pada semua tabel tanpa policy agar akses lewat API Supabase publik tertutup.
- `SUPABASE_SERVICE_ROLE_KEY`, kunci AWS, dan kunci enkripsi hanya dipakai di server.

## 8. Urutan Pengerjaan

| Tahap | Isi | Hasil |
|---|---|---|
| 1 | Setup project, Supabase, Prisma migrate, auth email, middleware role, seed admin | Login talent/admin jalan |
| 2 | Form data diri, enkripsi NIK, consent | Talent bisa isi profil |
| 3 | Upload KTP/selfie/video (signed URL, validasi klien, frame video) | File tersimpan aman |
| 4 | Pengecekan otomatis (NIK, Rekognition, duplikat) + halaman review admin + email hasil | Alur verifikasi end-to-end |
| 5 | Event (admin), lowongan, apply, shortlist, konfirmasi | Rekrutmen berjalan |
| 6 | Absensi (GPS + selfie + timestamp), review, koreksi | Absensi berjalan |
| 7 | Dashboard, rekap + export, audit log, pengaturan | Laporan siap |
| 8 | Pengujian di HP nyata (iOS/Android), keamanan, retensi data, deploy | Siap rilis |
