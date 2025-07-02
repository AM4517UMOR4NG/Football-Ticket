Football Ticket Booking System

This is a web-based application for booking football match tickets. Users can register, log in, view upcoming events, and book tickets online. The system is equipped with modern security features and is designed for scalability and performance. It is currently under development and welcomes contributions to enhance its functionality.

Table of Contents

Features

Technologies Used

Architecture

Database Schema

API Documentation

Security

Performance

Monitoring and Logging

Deployment

Testing

Production Checklist

Troubleshooting

Getting Started

Contributing

Changelog

Notes

License

Features

User Authentication: Register and log in with secure password validation.

Ticket Booking: Book tickets for football matches online.

Event Management: View upcoming events; admins can manage events.

Security Auditing: Track login attempts, registrations, and suspicious activities.

Rate Limiting: Prevent brute-force attacks on login and registration endpoints.

JWT Authentication: Secure API endpoints with JSON Web Tokens.

Admin Monitoring: Admins can view security status and logs.

Technologies Used

Java 17

Spring Boot 3

Spring Security

Spring Data JPA

H2 Database (development; replaceable with a production database)

JWT (io.jsonwebtoken)

Lombok

Jakarta Validation

Maven

HTML, CSS, JavaScript (static frontend)

Architecture

The application follows a layered architecture:

Controller: Handles HTTP requests and responses.

Service: Contains business logic.

Repository: Manages data access with JPA.

Entity: Represents database tables.

Security is enforced through filters:

JWT Filter

Rate Limit Filter

Security Audit

Database Schema

User: id, username, email, password, fullName, phoneNumber, role

Event: id, title, description, venue, dateTime, availableSeats, price

Booking: id, user_id, event_id, numberOfTickets, totalAmount, status, bookingReference

API Documentation

Authentication

POST /api/auth/register

Register a new user.

Request:

{
  "username": "YourName",
  "email": "user@example.com",
  "password": "Password123.!",
  "fullName": "Fullname",
  "phoneNumber": "081234567890",
  "role": "USER"
}

Response:

{
  "success": true,
  "message": "User registered successfully"
}

POST /api/auth/login

Log in a user.

Request:

{
  "username": "YourName",
  "password": "Password123.!"
}

Response:

{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "YourName",
  "email": "user@example.com",
  "fullName": "Fullname"
}

Events

GET /api/events/all

Retrieve all events.

Response:

[
  {
    "id": 1,
    "title": "Persija vs Persib",
    "description": "Indonesian Classic Match",
    "venue": "GBK Stadium",
    "dateTime": "2024-01-15T19:00:00",
    "availableSeats": 50000,
    "price": 95000
  }
]

GET /api/events/upcoming

Retrieve upcoming events (filtered for future events).

Bookings

POST /api/bookings/create

Create a new booking (requires authentication).

Headers: Authorization: Bearer {token}

Request:

{
  "eventId": 1,
  "numberOfTickets": 2
}

Response:

{
  "id": 1,
  "bookingReference": "BK20240115001",
  "eventTitle": "Persija vs Persib",
  "numberOfTickets": 2,
  "totalAmount": 190000,
  "status": "CONFIRMED"
}

GET /api/bookings/user

Retrieve a user's bookings (requires authentication).

Headers: Authorization: Bearer {token}

Response:

[
  {
    "id": 1,
    "bookingReference": "BK20240115001",
    "eventTitle": "Persija vs Persib",
    "numberOfTickets": 2,
    "totalAmount": 190000,
    "status": "CONFIRMED"
  }
]

Security

JWT Authentication: Tokens expire after 24 hours, using the HS512 algorithm.

Rate Limiting: 10 requests per minute for login/register, tracked by IP.

Password Policy: Minimum 8 characters, requiring uppercase, lowercase, numbers, and special characters; hashed with BCrypt.

Audit Logging: Tracks login attempts, registrations, unauthorized access, and suspicious activities.

CORS: Configurable allowed origins via environment variables.

Security Headers: Includes X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, and Strict-Transport-Security.

Performance

Database: Optimized with HikariCP connection pooling, batch processing, and indexing.

Caching: In-memory caching for static data; session-based caching for user data.

Monitoring and Logging

Metrics: Tracks request times, error rates, database connections, and memory usage.

Logging: Structured with SLF4J; different levels for environments, including security audits, performance, and errors.

Deployment

Development

Install Java 17 and Maven.

Clone the repository:

git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git

Run:

mvn spring-boot:run

Access at: http://localhost:8080

H2 Console: http://localhost:8080/h2-console

Production

Set environment variables:

JWT_SECRET

JWT_EXPIRATION

CORS_ALLOWED_ORIGINS

DATABASE_URL

DATABASE_USERNAME

DATABASE_PASSWORD

Build and run:

mvn clean package -Pprod
java -jar target/ticket-booking-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

Docker

Dockerfile:

FROM openjdk:17-jre-slim
COPY target/ticket-booking-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]

Build and run:

docker build -t ticket-booking .
docker run -p 8080:8080 ticket-booking

Testing

Unit Tests: Service layer with Mockito, repository with @DataJpaTest

API Tests: Postman, RestAssured

Performance: JMeter

Security Tests: JWT validation, rate limiting, password checks

Production Checklist

Security:

JWT secret configured

CORS restricted

Rate limiting enabled

Audit logging active

Security headers set

HTTPS enabled

Performance:

Database indexes optimized

Connection pooling configured

Caching implemented

Logging levels appropriate

Memory settings optimized

Monitoring:

Health checks configured

Metrics collection active

Alerting set up

Log aggregation working

Database monitoring active

Security monitoring enabled

Troubleshooting

JWT Token Expired: Check JWT_EXPIRATION.

Rate Limit Exceeded: Wait 1 minute.

Database Issues: Verify HikariCP settings.

CORS Errors: Confirm allowed origins.

Password Validation: Ensure compliance.

For debugging, add to application.properties:

logging.level.com.example.ticketbooking=DEBUG
logging.level.org.springframework.security=DEBUG

Getting Started

Prerequisites

Java 17

Maven

Git

Steps

git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git
mvn spring-boot:run

Access at: http://localhost:8080

Contributing

Fork the repository.

Create a branch: git checkout -b feature/your-feature

Make changes and test.

Submit a pull request.

Pass code review and CI.

Changelog

v1.0.0: Initial release with booking

v1.1.0: Security + auditing

v1.2.0: Performance + monitoring

v1.3.0: Docker + CI/CD

Notes

Configure environment variables for production

Replace H2 with PostgreSQL/MySQL

Review audit logs and metrics

Update dependencies regularly

License

This project is licensed under the MIT License.

