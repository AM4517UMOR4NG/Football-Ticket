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
        json

{
  "username": "YourName",
  "email": "user@example.com",
  "password": "Password123.!",
  "fullName": "Fullname",
  "phoneNumber": "081234567890",
  "role": "USER"
}
Response:
json

    {
      "success": true,
      "message": "User registered successfully"
    }

POST /api/auth/login
Log in a user.

    Request:
    json

{
  "username": "YourName",
  "password": "Password123.!"
}
Response:
json

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
        json

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
    Retrieve upcoming events.
        Response: Similar to /api/events/all, filtered for future events.

Bookings

    POST /api/bookings/create
    Create a new booking (requires authentication).
        Headers: Authorization: Bearer {token}
        Request:
        json

{
  "eventId": 1,
  "numberOfTickets": 2
}
Response:
json

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
    json

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

    GET /api/admin/security/status
    Get security status (requires ADMIN role).
        Headers: Authorization: Bearer {token}
        Response:
        json

        {
          "timestamp": "2024-01-15T10:30:00",
          "securityLevel": "ENHANCED",
          "rateLimitingEnabled": true,
          "passwordValidationEnabled": true,
          "auditLoggingEnabled": true
        }

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
    Clone the repository: git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git.
    Run: mvn spring-boot:run.
    Access at http://localhost:8080.
    H2 Console at http://localhost:8080/h2-console.

Production

    Set environment variables:
        JWT_SECRET: Strong secret key
        JWT_EXPIRATION: Token expiration time (e.g., 86400000 for 24 hours)
        CORS_ALLOWED_ORIGINS: Allowed domains
        DATABASE_URL: Production database URL
        DATABASE_USERNAME: Database username
        DATABASE_PASSWORD: Database password
    Build: mvn clean package -Pprod.
    Run: java -jar target/ticket-booking-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod.

Docker

    Create a Dockerfile:
    dockerfile

FROM openjdk:17-jre-slim
COPY target/ticket-booking-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
Build and run:
bash

    docker build -t ticket-booking .
    docker run -p 8080:8080 ticket-booking

Testing

    Unit Tests: Service layer with Mockito, repository with @DataJpaTest, security with @WebMvcTest, integration with @SpringBootTest.
    API Tests: Postman collections, automated with RestAssured, performance with JMeter.
    Security Tests: Penetration testing, JWT validation, rate limiting, and password policy checks.

Production Checklist

    Security:

JWT secret configured
CORS restricted
Rate limiting enabled
Audit logging active
Security headers set
HTTPS enabled

    Error handling secure

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

    JWT Token Expired: Verify expiration time in JWT_EXPIRATION.
    Rate Limit Exceeded: Wait for the reset window (e.g., 1 minute).
    Database Issues: Check HikariCP connection pool settings.
    CORS Errors: Confirm CORS_ALLOWED_ORIGINS configuration.
    Password Validation: Ensure compliance with policy (8+ chars, mixed case, numbers, special chars).

For debugging, add to application.properties:
properties
logging.level.com.example.ticketbooking=DEBUG
logging.level.org.springframework.security=DEBUG
Getting Started
Prerequisites

    Java 17
    Maven
    Git

Steps

    Clone the repository: git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git.
    Run: mvn spring-boot:run.
    Access at http://localhost:8080.

For production, configure application-prod.properties with database and security settings.
Contributing

    Fork the repository.
    Create a feature branch: git checkout -b feature/your-feature.
    Make changes and test thoroughly.
    Submit a pull request.
    Ensure code review and CI checks pass.

Changelog

    v1.0.0: Initial release with basic booking functionality.
    v1.1.0: Added security features and audit logging.
    v1.2.0: Enhanced performance and monitoring.
    v1.3.0: Added Docker support and CI/CD pipeline.

Notes

    Configure environment variables (JWT_SECRET, JWT_EXPIRATION, CORS_ALLOWED_ORIGINS) for production security.
    Replace H2 with a production-grade database (e.g., PostgreSQL, MySQL) in production.
    Regularly review security audit logs and performance metrics.
    Update dependencies for security patches.

License

This project is licensed under the MIT License. See the LICENSE file for details.
Additional Instructions

To fully implement this README in your GitHub repository:

    Replace the Existing README: Copy the above markdown content into your README.md file at the root of the Football-Ticket repository.

    Add a LICENSE File: Create a LICENSE file in the repository root with the following content:
    text

This project is licensed under the MIT License.

Email----------------
                    |
                    |
____________________|
|
---<aekmohop@gmail.com

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣶⣶⣶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⠀⠀Suiiii!!!!!⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣾⡋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠻⠿⠻⠿⠻⢤⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⢀⢤⣒⣽⢍⣸⣷⣶⣉⣁⣀⠑⠤⠤⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢎⣨⡟⣉⣄⣴⡎⣳⡏⡏⣡⡦⣼⠋⣷⢦⣠⣫⠳⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢿⣅⠈⢹⡿⣼⡟⠷⣟⡷⢥⢷⢿⣻⢾⠇⣴⢮⡏⠆⢹⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡸⣾⣟⠈⠉⠊⡇⣤⣤⣭⣭⣷⢹⢸⢀⢹⣸⣿⢿⣾⣶⡳⡿⣻⣃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡎⣧⡾⣾⣆⢧⢰⢷⣿⡟⢿⠟⣿⣿⢠⣮⣙⣶⠏⣿⣿⣯⣮⡞⢯⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⢯⣍⣶⡽⣿⡿⢦⠻⢸⠘⢇⡨⣸⣿⢿⡾⡏⠿⠤⠞⠸⣿⣛⣹⡴⢮⣻⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⠟⣜⣿⣿⢿⡽⠋⠀⠘⣆⠀⠇⠸⣡⣿⣿⢘⠇⡇⠸⠇⠀⡀⡽⣿⣿⣋⣩⣶⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠟⣌⢦⣿⢡⡿⠊⠀⠀⠀⠀⠸⣆⡀⠀⢻⣿⣿⠈⠀⠀⠀⠀⢘⣼⣿⣷⢇⢻⣥⣿⣻⣮⢿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⡛⣡⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⢻⣙⠀⣾⣿⡧⡀⠀⠀⠀⣠⢾⣿⣿⡯⣿⡀⠹⣷⠃⠈⢷⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣴⣟⣽⣿⣿⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠳⡃⠿⢟⣒⠾⣤⣔⠮⣖⣽⢿⣿⢷⣹⣵⠀⠘⢦⡀⠀⢹⣮⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣴⣿⢻⣽⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠙⠶⣶⡚⢽⣦⡬⣭⣾⣯⣬⣏⣈⠁⢷⣧⠀⠀⠙⠢⣜⠸⠻⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣴⣶⡿⣯⢿⡿⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡶⡒⣾⣛⣿⣝⣛⡛⠒⠊⣀⢰⠻⠫⢬⣩⣯⡆⠀⠀⠀⠈⠳⣄⢩⠻⣿⢷⣦⣠⠤⣴⡶⠶⠀⠀⠀⠀⠀
⠀⣰⣿⣿⣿⣿⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢿⠀⣨⢯⢾⠚⣿⡙⢫⢉⠭⡏⢙⣿⡥⠿⢧⠁⠀⠀⠀⠀⠀⠈⠙⢾⣿⣟⣭⣥⣔⣧⣀⠀⠀⠀⠀⠀⠀
⣸⣿⡿⣿⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘⠸⠐⠃⣨⡟⢸⢹⢸⢸⠏⣠⠟⢥⡿⢛⣷⣮⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣻⣯⣿⡻⠿⣦⡄⠀⠀⠀
⠻⠿⢱⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠆⠰⡀⠰⠛⣡⣿⢠⢣⡌⢐⣃⣉⡡⠶⡥⢷⣮⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣻⣿⣶⣄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢀⡀⡧⠀⢰⠏⢸⠃⢎⣣⡯⠖⣟⢴⣊⣴⠿⠥⡽⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠇⠙⠋⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡇⢳⡷⣢⠀⠈⠑⠼⣀⠜⠁⠙⣊⢝⣿⣯⠵⠶⢤⣴⠹⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⢣⢇⡀⠙⢮⡑⠢⠤⠀⢻⠶⢖⣿⣷⣿⡿⠒⠢⣪⠟⡁⠀⠹⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢇⠘⠸⡍⡻⣶⡽⠦⠤⠒⢃⣠⣜⣻⠽⣭⡶⣦⡏⡤⠖⣽⡤⠀⢻⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⡏⣀⣀⡽⣑⣢⣕⣄⠤⡶⣽⠏⠉⠉⠉⠲⣤⣍⣈⠕⠪⢅⣠⡠⢤⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢷⡶⣂⣼⣿⢀⠀⠀⠀⣰⢯⠋⠀⠀⠀⠀⠀⢹⣾⣗⣾⠽⠓⠛⡿⡋⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠘⣿⣿⣭⡽⠗⠚⠛⠛⠋⠀⠀⠀⠀⠀⠀⠈⠉⠙⢧⠀⠀⠀⠘⢟⡟⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠋⠀⢈⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⡀⠀⠀⢈⡖⢸⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣥⣀⠠⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⣀⣴⣶⣷⣶⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠗⠈⠑⢮⣿⡾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡟⠋⠁⠘⡌⠙⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⢋⠀⠄⢱⡿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢩⠁⠀⢛⣱⡀⠈⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡮⣤⣦⡀⢀⡾⡝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡆⠖⠋⠁⢣⠀⠈⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠃⡰⠉⣳⣾⡝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡾⠋⠠⠈⣆⠀⠸⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠀⠀⢠⣾⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠣⡀⠀⠈⠀⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⢁⢤⣰⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣄⠀⠀⠀⠀⢇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⣮⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢆⠀⠀⣀⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠎⢤⡿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢣⢊⠬⠆⠑⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⡿⣥⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢦⣶⡒⢶⡞⠢⣄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣾⣛⡏⡻⣳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢿⣿⣿⣾⢷⣿⣿⣶⣯⡿⢆⡀
⠀⠀⠀⠀⠀⠀⠉⠉⠚⠚⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠦⠿⠿⠿⠿⠿⠿⠿⠿⠷⠷⠾


