# FootballTix

Matchday football ticketing platform built with **Spring Boot 3.1.5**, **Java 17**, **Spring Security (JWT + Google OAuth2)**, **H2 / JPA**, **Midtrans Snap**, and a static Tailwind + vanilla JavaScript frontend.

![FootballTix Banner](docs/assets/banner.png)

---

## Implemented Capabilities

- **Catalog & Leagues**: Filterable match fixtures across 6 seeded leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, UEFA Champions League) via `/api/events` and `/api/leagues`.
- **Concurrency-Safe Ticket Booking**: Row-level `PESSIMISTIC_WRITE` seat locking (`EventRepository.findByIdForUpdate`) prevents overselling under concurrent booking requests.
- **QR Entry Passes**: Server-side ISO/IEC 18004 PNG QR code generation via ZXing (`GET /api/bookings/{bookingReference}/qr`) scoped to ticket owner or staff.
- **Midtrans Snap Integration**: Server-verified payment status sync and SHA-512 signature + `gross_amount` webhook verification (`POST /api/payments/notification`).
- **Role-Based Access Control**:
  - `USER`: browse matches, manage wishlist, reserve/cancel tickets, view bookings, manage personal profile.
  - `CASHIER`: verify booking references and confirm counter payments (`cashier-dashboard.html`).
  - `ADMIN`: manage fixtures, leagues, users, bookings, audit logs, and system status (`admin-dashboard.html`, `admin-profile.html`).
- **Security Hardening**: Method-level `@PreAuthorize` guards, forced `USER` role on self-registration, strong password policy validation, configurable IP rate limiting, explicit CORS allowlist, and H2 console isolation in production.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Java 17, Spring Boot 3.1.5, Spring Web, Spring Data JPA, Spring Security |
| Auth | JJWT 0.11.5 (HS512), Google API Client 2.2.0 (`emailVerified` enforcement) |
| Payment | Midtrans Java Library 3.2.1 (Snap) |
| QR Code | Google ZXing Core & JavaSE 3.5.3 |
| Database | H2 (`mem:testdb` default for dev; console disabled in `prod` profile) |
| Frontend | Static HTML5, Tailwind CSS (CDN), Barlow & Barlow Condensed, Vanilla ES6+ |

---

## Getting Started

### Prerequisites

- **JDK 17+**
- Built-in **Maven Wrapper** (`./mvnw` on Linux/macOS or `.\mvnw.cmd` on Windows)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git
cd Football-Ticket
```

Dev defaults work out of the box on H2 in-memory storage. For custom or production runs, set environment variables based on [`.env.example`](.env.example):

| Variable | Description | Dev Default |
| --- | --- | --- |
| `JWT_SECRET` | HS512 signing secret (min. 64 bytes in prod) | Dev fallback in `application.properties` |
| `JWT_EXPIRATION` | Token lifetime in milliseconds | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed browser origins | `localhost:3000,8080`, `127.0.0.1:5500` |
| `GOOGLE_CLIENT_ID` | Optional Google Sign-In OAuth2 Client ID | Empty |
| `MIDTRANS_SERVER_KEY` | Midtrans Snap Server Key | Empty |
| `MIDTRANS_CLIENT_KEY` | Midtrans Snap Client Key | Empty |
| `MIDTRANS_IS_PRODUCTION` | Enable Midtrans production gateway (`true`/`false`) | `false` |
| `PAYMENT_ALLOW_SIMULATION` | Allow simulated payment fallback (keep `false` in prod) | `false` |
| `TRUST_PROXY_HEADERS` | Trust `X-Forwarded-For` behind reverse proxy | `false` |

### 2. Run the Application

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080).

### 3. Default Development Accounts

Seeded automatically on startup by `UserService`:

| Role | Username | Password |
| --- | --- | --- |
| `ADMIN` | `Alogo12` | `Alogo.situ24` |
| `CASHIER` | `cashier1` | `Alogo.situ24` |

> Standard fan accounts can be created through `register.html` (`POST /api/auth/register`). New passwords must be at least 8 characters and include uppercase, lowercase, digit, and special character.

---

## Running Tests

Run the full test suite (`TicketBookingApplicationTests`, `SecurityHardeningTests`, `FunctionalIntegrityTests`):

```powershell
.\mvnw.cmd test
```

```bash
./mvnw test
```

---

## Core API Endpoints

| Area | Method & Path | Access |
| --- | --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google` | Public |
| Auth | `GET /api/auth/verify` | Authenticated |
| Events | `GET /api/events`, `GET /api/events/upcoming`, `GET /api/events/featured`, `GET /api/events/search` | Public |
| Events | `POST /api/events`, `PUT /api/events/{id}`, `DELETE /api/events/{id}` | `ADMIN` |
| Leagues | `GET /api/leagues`, `GET /api/leagues/active`, `GET /api/leagues/{id}` | Public |
| Leagues | `POST /api/leagues`, `PUT /api/leagues/{id}`, `DELETE /api/leagues/{id}` | `ADMIN` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/my-bookings`, `POST /api/bookings/{id}/cancel` | Authenticated |
| Bookings | `GET /api/bookings/{bookingReference}/qr` | Owner / Staff |
| Bookings | `POST /api/bookings/{bookingId}/confirm` | `ADMIN`, `CASHIER` |
| Payments | `GET /api/payments/client-key`, `POST /api/payments/notification` | Public / Signed Webhook |
| Payments | `GET /api/payments/status/{ref}`, `POST /api/payments/sync-status/{orderId}` | Authenticated |
| Profile | `GET /api/profile`, `PUT /api/profile`, `POST /api/profile/change-password`, `GET /api/profile/stats` | Authenticated |
| Wishlist | `GET /api/wishlist/my-wishlist`, `POST /api/wishlist/add`, `DELETE /api/wishlist/remove/{eventId}` | Authenticated |
| Admin | `GET/PUT /api/admin/profile`, `GET /api/admin/stats`, `GET /api/admin/users/search`, `DELETE /api/admin/users/{id}`, `GET /api/admin/audit-logs` | `ADMIN` |

---

## Project Structure

```text
Football-Ticket
├── .env.example
├── LICENSE
├── pom.xml
├── src
│   ├── main
│   │   ├── java/com/example/ticketbooking
│   │   │   ├── config/        # SecurityConfig, CorsConfig, DataInitializer, StaticResourceConfig
│   │   │   ├── controller/    # REST controllers for auth, events, bookings, payments, admin, cashier
│   │   │   ├── dto/           # Request & response records/classes
│   │   │   ├── entity/        # User, Event, League, Booking, Wishlist JPA entities
│   │   │   ├── exception/     # GlobalExceptionHandler & ResourceNotFoundException
│   │   │   ├── repository/    # Spring Data JPA repositories (including PESSIMISTIC_WRITE locks)
│   │   │   ├── security/      # JWT provider/filter, RateLimitFilter, PasswordValidationService
│   │   │   └── service/       # Booking, Event, League, Midtrans, ZXing QR, User, Wishlist services
│   │   └── resources
│   │       ├── application.properties
│   │       ├── application-prod.properties
│   │       └── static/        # Matchday Editorial UI (21 HTML pages, theme.css, layout.js, page modules)
│   └── test/java/com/example/ticketbooking
│       ├── TicketBookingApplicationTests.java
│       ├── SecurityHardeningTests.java
│       └── FunctionalIntegrityTests.java
```

---

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Alogo Situmorang.
