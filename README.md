<!--
  FootballTix README — bilingual (ID + EN) documentation
-->

# FootballTix – Football Ticketing System

**ID:** Platform pemesanan tiket sepak bola end-to-end berbasis Spring Boot 3 dengan antarmuka statis modern (Tailwind + JavaScript) dan data persistensi H2 file-based.

**EN:** An end-to-end football ticketing platform powered by Spring Boot 3, Tailwind-enhanced static pages, and a persistent H2 datastore.

---

## 📚 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Feature Matrix](#feature-matrix)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Module Breakdown](#module-breakdown)
6. [Domain & Data Model](#domain--data-model)
7. [API Surface](#api-surface)
8. [Authentication & Authorization](#authentication--authorization)
9. [Configuration & Environment](#configuration--environment)
10. [Local Development Guide](#local-development-guide)
11. [Sample Data & Default Accounts](#sample-data--default-accounts)
12. [Deployment Checklist](#deployment-checklist)
13. [Troubleshooting & FAQ](#troubleshooting--faq)
14. [Contribution Workflow](#contribution-workflow)
15. [License & Support](#license--support)
16. [Appendix](#appendix)

---

## Platform Overview
- **Domain / Domain**: leagues, events, bookings, tickets, payments, wishlists, dashboards, privacy & information pages.
- **Personas**: Fans (USER), Admin ops (ADMIN), Cashier (CASHIER) untuk transaksi on-site.
- **Value Proposition**: satu aplikasi untuk eksplorasi liga, pemesanan tiket virtual, monitoring kapasitas, dan pengelolaan admin/kasir.

> Semua halaman publik mendukung bahasa Inggris/Indonesia secara konten, sedangkan README menyertakan penjelasan bilingual agar mudah diadopsi oleh tim lokal maupun global.

---

## Feature Matrix
| Area | Capabilities |
| --- | --- |
| **Leagues & Events** | CRUD liga/event, filter multi-kriteria, statistik, gambar Unsplash fallback |
| **Bookings & Tickets** | Virtual tickets, kuota kursi, status (PENDING/CONFIRMED/COMPLETED/CANCELLED), riwayat user |
| **Discovery** | Featured/upcoming events, pencarian bebas, badges liga/tanggal, wishlist |
| **Dashboards** | Admin, cashier, dan user dashboard dengan ringkasan data real-time |
| **Authentication** | Form login/register, JWT bearer, password policy ketat, optional Google OAuth |
| **Payments** | Midtrans integration-ready endpoints (server/client key lewat env) |
| **Pages & Content** | Index, about, privacy policy, important information, FAQ, terms, login/register/profile |
| **UI/UX** | Tailwind design, animations, responsive layout, toast notifications, skeleton loading |

---

## Architecture Overview
```
[Browser]
  ├── Static Pages (HTML + Tailwind CSS)
  ├── Vanilla JS Modules (fetch API, state, animations)
  └── Auth Storage (localStorage/sessionStorage)
        │
        ▼
[Spring Boot 3 Application]
  ├── Controllers (REST + MVC)
  ├── Services (business logic, validation)
  ├── Security (JWT filter, OAuth helper, password policy)
  ├── Repositories (Spring Data JPA)
  └── Config (Data initializer, CORS, Midtrans helpers)
        │
        ▼
[H2 File Database]
```

- **Security chain**: Spring Security → JWT filter → Role-based access → Controller.
- **Persistence**: `jdbc:h2:file:./data/footballtix.mv.db` menjaga data antar restart.

---

## Technology Stack
- **Backend**: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT, H2 Database.
- **Frontend**: HTML5, Tailwind CSS (CDN), Font Awesome, vanilla ES6 modules.
- **Build/Tooling**: Maven, Lombok, HikariCP, SLF4J, CommandLineRunner data seeding.

---

## Module Breakdown
### Backend Packages
```
com.example.ticketbooking
├── config/        # DataInitializer, payment & security helpers
├── controller/    # Event, League, Auth, Booking, Payment, Dashboard, Policy, etc.
├── dto/           # EventDTO, LeagueDTO, BookingDTO, UserRegistrationDTO, PaymentRequest...
├── entity/        # Event, League, Booking, User, Wishlist
├── exception/     # Global exception handler, custom runtime exceptions
├── repository/    # JPA repositories for each aggregate
├── security/      # JWT utilities, password validation, Google OAuth helper
└── service/       # EventService, BookingService, PaymentService, UserService, WishlistService, etc.
```

### Frontend Assets
- `static/index.html`, `about.html`, `privacy-policy.html`, `important-information.html`, `faq.html`, `terms.html`.
- `static/js/`: `index.js`, `auth.js`, `bookings.js`, `global.js`, `important-information.js`, dsb.
- `static/css/`: Tailwind customizations + page-specific styles.

---

## Domain & Data Model
| Entity | Fields (utama) | Catatan |
| --- | --- | --- |
| **League** | name, description, country, foundedYear, totalTeams, logoUrl, bannerUrl, seasonStart/End, status | ACTIVE/INACTIVE |
| **Event** | title, description, venue, eventDate, totalSeats, seatsAvailable, price, imageUrl, league | Dikaitkan ke `League` |
| **Booking** | user, event, seatCount, totalAmount, status, paymentMethod, createdAt/updatedAt | Status enum PENDING/CONFIRMED/COMPLETED/CANCELLED |
| **User** | username, email, password, fullName, phone, address, role, googleId, timestamps | Roles: USER/ADMIN/CASHIER |
| **Wishlist** | user, event | Menandai event favorit |

Sample league & event di-inject jika database kosong saat startup.

---

## API Surface
| Domain | Endpoint | Deskripsi |
| --- | --- | --- |
| Events | `GET /api/events`, `/featured`, `/upcoming`, `/search`, `/stats`, `/league/{league}`, `/{id}` | Browse & stats |
| Leagues | `GET /api/leagues`, `/active`, `/search`, `/{id}`, `/{id}/events/count` | Manajemen liga |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, Google callback | Registrasi & login JWT |
| Booking | `POST /api/bookings`, `GET /api/bookings/user`, status update endpoints | Kelola booking user |
| Wishlist | `GET/POST/DELETE /api/wishlist` | Favorite events |
| Payment | `POST /api/payments/midtrans/charge` (placeholder) | Integrasi Midtrans (server-side) |
| Dashboards | Admin/Cashier/User specific endpoints (lihat controller terkait) | Ringkasan data |

> Detail format request/response tersedia di masing-masing controller & DTO.

---

## Authentication & Authorization
- **JWT**: Access token dikirim lewat Authorization header (`Bearer <token>`).
- **Password Policy**: `PasswordValidationService` mewajibkan kombinasi uppercase, lowercase, angka, simbol, tanpa pola umum.
- **Roles**:
  - `USER`: browsing & booking.
  - `ADMIN`: CRUD event/liga, statistik, monitoring.
  - `CASHIER`: transaksi on-site & dashboard kasir.
- **Google OAuth** (opsional): aktifkan dengan mengisi `app.google.client-id`, `client-secret`, dan `redirect`.

---

## Configuration & Environment
| Key | Description |
| --- | --- |
| `server.port` | Default 8080. Override via `--server.port=XXXX`. |
| `spring.datasource.url` | `jdbc:h2:file:./data/footballtix;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE` untuk persistensi. |
| `spring.jpa.hibernate.ddl-auto` | `update` (ubah ke `validate` di produksi). |
| `app.jwt.secret` | **Wajib** diganti saat produksi (gunakan env var). |
| `app.jwt.expiration` | Default 86.400.000 ms (24 jam). |
| `app.cors.allowed-origins` | Daftar origin frontend yang diizinkan. |
| `midtrans.*` | Gunakan environment variable: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID`. Jangan hardcode key produksi. |
| `logging.level.*` | Saat ini DEBUG untuk dev; set ke INFO/WARN di produksi. |

> Secrets harus dikelola melalui environment variables / secret manager. GitHub push protection akan memblokir commit yang mengandung key produksi.

---

## Local Development Guide
1. **Prerequisites**: Java 17+, Maven 3.6+, browser modern.
2. **Install dependencies & run**:
   ```bash
   mvn spring-boot:run
   ```
3. **Access app**: http://localhost:8080 (data contoh otomatis dimuat).
4. **Alternate port**:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
   ```
5. **H2 Console**: http://localhost:8080/h2-console (gunakan JDBC URL yang sama). Aktifkan hanya saat development.

---

## Sample Data & Default Accounts
| Role | Username | Password | Email |
| --- | --- | --- | --- |
| ADMIN | `Alogo12` | `Alogo.situ24` | alogo12@example.com |
| CASHIER | `cashier1` | `Alogo.situ24` | cashier1@example.com |

> Gantilah kredensial bawaan ini ketika deployment produksi.

---

## Deployment Checklist
1. Set environment variables (JWT secret, Midtrans keys, DB credentials jika pakai RDBMS lain).
2. Switch database ke produksi (PostgreSQL/MySQL) bila diperlukan.
3. Atur `spring.jpa.hibernate.ddl-auto=validate` dan matikan H2 console.
4. Update CORS origins ke domain publik aplikasi.
5. Set logging level ke INFO/WARN dan konfigurasikan log rotation.
6. Jalankan build jar:
   ```bash
   mvn clean package
   java -jar target/ticket-booking-0.0.1-SNAPSHOT.jar
   ```
7. Monitoring: gunakan layanan log management / APM untuk menangkap error produksi.

---

## Troubleshooting & FAQ
| Issue | Penyebab umum | Solusi |
| --- | --- | --- |
| `H2 file locked` | Ada proses lain memakai DB file. | Hentikan proses lama atau hapus `data/footballtix.mv.db` (reset data). |
| Port 8080 used | Server lain sudah jalan. | Stop proses tersebut atau jalankan pada port lain. |
| Push ditolak (secret scanning) | Key produksi tertinggal di commit. | Ganti dengan placeholder/env var, force remove dari history, lalu push ulang. |
| JWT invalid/expired | Token lama atau secret berubah. | Login ulang untuk mendapatkan token baru. |
| Tailwind styles tidak tampil | CDN blocked/offline. | Pastikan koneksi internet atau bundle CSS secara lokal untuk produksi. |

---

## Contribution Workflow
1. Fork & clone repository.
2. Buat branch fitur: `git checkout -b feature/<nama-fitur>`.
3. Implementasi + tambahkan test jika relevan.
4. Jalankan `mvn verify` (atau minimal `mvn test`) bila tersedia.
5. Commit dengan pesan deskriptif dan push ke branch Anda.
6. Buka Pull Request, sertakan ringkasan fitur/bugfix, screenshot jika perubahan UI.

> Pastikan tidak meng-commit secret, file `data/`, atau kredensial lainnya.

---

## License & Support
- **License**: MIT License.
- **Support / Contact**: aekmohop@gmail.com.

---

## Appendix
### Tech Stack Snapshot
- **Core**: Spring Boot 3, Java 17, Maven.
- **Database**: H2 (dev) — dapat diganti PostgreSQL/MySQL.
- **Frontend**: Tailwind CSS, Font Awesome, vanilla JS modules.
- **Security**: Spring Security, JWT, custom password policy, optional Google OAuth.

### Maintenance Notes
- Folder `data/` menyimpan DB file; backup bila ingin mempertahankan data dev.
- Logging default DEBUG membantu debugging; ubah untuk produksi.
- Payment integration endpoint siap dihubungkan dengan Midtrans sandbox ketika key tersedia.

---

**FootballTix** – Booking mudah, pengalaman stadion maksimal / Seamless ticketing for unforgettable matchdays.

