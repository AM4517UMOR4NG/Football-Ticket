<!--
  FootballTix README — bilingual (ID + EN) documentation
-->

# FootballTix – Football Ticket Booking System

**ID:** Platform pemesanan tiket sepak bola end-to-end berbasis Spring Boot 3 dengan antarmuka statis modern (Tailwind + JavaScript) dan data persistensi H2 file-based.

**EN:** An end-to-end football ticketing platform powered by Spring Boot 3, Tailwind-enhanced static pages, and a persistent H2 datastore.

src/main/resources
├── static/                # HTML, CSS, JS untuk halaman publik & dashboard
└── application.properties # Konfigurasi default

## 1. Ikhtisar Sistem
- **Domain utama**: liga, event pertandingan, tiket, booking, wishlist, dashboard admin/cashier/user, info kebijakan (privacy & important info).
- **Target pengguna**: fans (USER), administrator operasional (ADMIN), kasir (CASHIER) yang menangani transaksi langsung.
- **Fitur kunci**:
  - CRUD liga & event, statistik, filtering multi-kriteria, gambar event dengan fallback.
  - Booking tiket (virtual), kuota kursi & harga, wishlist, notifikasi UI dinamis.
  - Autentikasi JWT, password policy ketat, integrasi Google OAuth opsional.
  - Payment gateway Midtrans (placeholder ready), logging debug, CORS konfigurabel.
  - Halaman informatif: about, privacy policy, important information, FAQ, terms.

## 2. Arsitektur
```
[Browser] --(HTML/CSS/JS + fetch)--> [Spring Boot REST Controllers]
                                         |
                                         |-- Services (EventService, LeagueService, BookingService, UserService, PaymentService, WishlistService, dsb.)
                                         |
                                         |-- Spring Data JPA Repositories (EventRepository, LeagueRepository, BookingRepository, UserRepository, WishlistRepository)
                                         |
                                         '-- H2 Database (file ./data/footballtix.mv.db)

Security chain: Spring Security -> JWT filter -> Role-based access (USER/ADMIN/CASHIER)
```

## 3. Struktur Proyek (ringkas)
```
src/main/java/com/example/ticketbooking
├── config/                # Data initializer, Midtrans, security util
├── controller/            # REST + page controllers (event, league, booking, auth, dashboard, policy, payment, wishlist, dll)
├── dto/                   # Transfer objects (EventDTO, LeagueDTO, BookingDTO, UserRegistrationDTO, PaymentRequest, dsb.)
├── entity/                # JPA entities (Event, League, Booking, User, Wishlist)
├── exception/             # Custom exceptions + handler
├── repository/            # Spring Data interfaces
├── security/              # JWT, token provider, password validation, Google OAuth helper
└── service/               # Domain services (EventService, BookingService, UserService, PaymentService, StatistikService, dsb.)

src/main/resources
├── static/                # HTML, CSS, JS untuk halaman publik & dashboard
└── application.properties # Konfigurasi default
```

## 4. Model Data & Domain
- **League**: nama, deskripsi, negara, foundedYear, totalTeams, logo/banner, status (ACTIVE/INACTIVE), seasonStart/End.
- **Event**: title, description, venue, eventDate, price (BigDecimal), totalSeats, seatsAvailable, league, imageUrl.
- **Booking**: user, event, jumlah kursi, totalAmount, status (PENDING/CONFIRMED/COMPLETED/CANCELLED), metode pembayaran, timestamps.
- **User**: username unik, email, password terenkripsi, fullName, phone, address, role, googleId, audit timestamps.
- **Wishlist**: relasi user-event untuk favorit.

Data sampel (6 liga + 12 event) dan akun default dibuat melalui `DataInitializer` & `UserService.initDefaultAdmin()` saat tabel kosong.

### Akun default (dev)
| Role   | Username | Password     | Email                  |
|--------|----------|--------------|------------------------|
| ADMIN  | Alogo12  | Alogo.situ24 | alogo12@example.com    |
| CASHIER| cashier1 | Alogo.situ24 | cashier1@example.com   |

> Ubah atau nonaktifkan akun ini di produksi.

## 5. Autentikasi & Keamanan
- **JWT Bearer**: token diberikan saat login (`/api/auth/login`).
- **Password Policy**: minimal 8 karakter, kombinasi uppercase/lowercase/angka/simbol, memblok password umum/sekuensial (lihat `PasswordValidationService`).
- **Roles**: USER (default), ADMIN (mengelola liga/event/statistik), CASHIER (mencatat transaksi di kasir).
- **Google OAuth**: opsional via `app.google.*` properties (default disabled).
- **H2 Console**: `/h2-console` hanya untuk pengembangan (aktif melalui `spring.h2.console.enabled=true`).

## 6. Layanan & Modul Backend
- `EventController`, `EventService`: daftar event (semua, featured, upcoming), detail per ID, filter per liga, search query, statistik (total event, kursi tersedia, avg price).
- `LeagueController`, `LeagueService`: CRUD liga, daftar aktif, pencarian, hitung event per liga.
- `BookingController`, `BookingService`: buat booking, update status, ringkasan booking per user.
- `PaymentController`: endpoint placeholder integrasi Midtrans (client/server key di properties).
- `WishlistController`: tambah/hapus/list wishlist user.
- `AdminDashboardController`, `CashierDashboardController`, `UserDashboardController`: menyediakan data agregat untuk UI dashboard per peran.
- `AuthController`: registrasi, login, refresh token opsional, Google callback.
- `ProfileController`: update profil & password.
- `SecurityMonitoringController`: log aktivitas keamanan dasar.

## 7. Frontend
- **Halaman utama (`index.html`)**: hero, filter (liga, tanggal, teks), daftar event, statistik ringkas, toast notification.
- **Halaman info (`about.html`, `privacy-policy.html`, `important-information.html`, `faq.html`, `terms.html`)**: konten statis dengan Tailwind + animasi.
- **Auth pages (`login.html`, `register.html`, `profile.html`)**: koneksi ke API auth.
- **Dashboard pages**: `admin-dashboard.html`, `cashier-dashboard.html`, `user-dashboard.html` memanfaatkan data API.
- **JavaScript**: modul di `static/js/` meliputi `index.js` (filter & UI), `auth.js`, `bookings.js`, `global.js` (update navbar), `important-information.js`, dsb.

## 8. API Ringkas
| Domain  | Endpoint (contoh)                                | Deskripsi singkat                    |
|---------|--------------------------------------------------|--------------------------------------|
| Events  | `GET /api/events`, `/featured`, `/upcoming`      | Listing event                        |
|         | `GET /api/events/{id}`                           | Detail event                         |
|         | `GET /api/events/league/{league}`                | Event per liga                       |
|         | `GET /api/events/search?query=...`               | Full-text search                     |
|         | `GET /api/events/stats`                          | Statistik agregat                    |
| Leagues | `GET /api/leagues`, `/active`, `/search`         | Listing & filter liga                |
|         | `GET /api/leagues/{id}`                          | Detail liga                          |
|         | `GET /api/leagues/{id}/events/count`             | Hitung event per liga                |
| Auth    | `POST /api/auth/register`, `/login`              | Registrasi & login JWT               |
| Booking | `POST /api/bookings`, `GET /api/bookings/user`   | Kelola booking user                  |
| Payment | `POST /api/payments/midtrans/charge` (placeholder)| Integrasi Midtrans                   |
| Wishlist| `GET/POST/DELETE /api/wishlist`                  | Favorit event                        |

> Lihat controller terkait untuk detail request/response schema.

## 9. Konfigurasi (application.properties)
| Properti                      | Default / Catatan                                                                 |
|-------------------------------|-----------------------------------------------------------------------------------|
| `server.port`                 | 8080                                                                              |
| `spring.datasource.url`       | `jdbc:h2:file:./data/footballtix;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE`     |
| `spring.jpa.hibernate.ddl-auto`| `update` (untuk dev; gunakan `validate` di produksi)                             |
| `app.jwt.secret`              | Default string (ganti di produksi)                                                |
| `app.jwt.expiration`          | 86.400.000 ms (1 hari)                                                            |
| `app.cors.allowed-origins`    | `http://localhost:3000`, `http://localhost:8080`, `http://127.0.0.1:5500`, dll    |
| `app.google.*`                | Client ID/secret/redirect; set agar OAuth aktif                                   |
| `midtrans.*`                  | Server key, client key, merchant id, flag produksi                                |
| `logging.level.*`             | DEBUG untuk keamanan/web/aplikasi (ubah di produksi)                              |

## 10. Menjalankan Aplikasi
1. **Prasyarat**: Java 17+, Maven 3.6+, browser modern.
2. **Install dependensi & jalankan**
   ```bash
   mvn spring-boot:run
   ```
3. **Akses**: http://localhost:8080 (otomatis memuat data contoh + akun default).
4. **Port alternatif** (jika 8080 terpakai):
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
   ```
5. **H2 Console**: http://localhost:8080/h2-console (JDBC URL sama dengan datasource). Gunakan hanya di dev.

## 11. Workflow Pengembangan
1. Fork -> clone repo.
2. Buat branch fitur: `git checkout -b feature/nama-fitur`.
3. Jalankan test (jika tersedia) / `mvn verify`.
4. Commit dengan pesan deskriptif, push, buka Pull Request.
5. Pastikan tidak membocorkan secret (JWT/Google/Midtrans) ke repo publik.

## 12. Catatan Tambahan
- Folder `data/` menyimpan file DB H2. Jika terjadi lock, hentikan proses lain atau hapus file `footballtix.mv.db` (akan reset data).
- Midtrans belum dihubungkan ke sandbox nyata; endpoint siap dikaitkan dengan credential resmi.
- Frontend menggunakan Tailwind CDN; tidak ada build step tambahan.
- Logging level saat ini DEBUG untuk memudahkan tracing (ubah ke INFO di produksi).

## 13. Dukungan & Lisensi
- Lisensi: MIT
- Pertanyaan/dukungan: aekmohop@gmail.com

---

**FootballTix** – Booking mudah, pengalaman stadion maksimal.
>>>>>>> 715b1e7 (Update README to Indonesian with comprehensive system documentation including architecture overview, data models, API endpoints, configuration details, and deployment workflow)

