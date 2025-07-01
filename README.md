Title
Football Ticket Booking System

Description
This application is a web-based football match ticket booking system that allows users to view event schedules, register, login, and book tickets online. The system is equipped with modern security features such as JWT authentication, rate limiting, security auditing, and password validation.

Key Features
- User registration and login with strong password validation
- Online football match ticket booking
- View upcoming football event schedules
- Event management by admin
- Security auditing for login, registration, and suspicious activities
- Rate limiting to prevent brute force on login and registration endpoints
- Endpoint protection with JWT (JSON Web Token)
- Security monitoring for admin
- Production security configuration (CORS, session, security headers, logging, etc.)

Technologies Used
- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- H2 Database (can be replaced with production database)
- JWT (io.jsonwebtoken)
- Lombok
- Jakarta Validation
- Maven
- HTML, CSS, JavaScript (static front-end)

Architecture Overview
- Layered Architecture: Controller -> Service -> Repository -> Entity
- Security Layer: JWT Filter -> Rate Limit Filter -> Security Audit
- Data Layer: JPA/Hibernate with H2 Database
- Presentation Layer: Static HTML/CSS/JS with REST API
- Cross-cutting Concerns: Logging, Validation, Exception Handling

Database Schema
- User: id, username, email, password, fullName, phoneNumber, role
- Event: id, title, description, venue, dateTime, availableSeats, price
- Booking: id, user_id, event_id, numberOfTickets, totalAmount, status, bookingReference

API Documentation

Authentication Endpoints

POST /api/auth/register
Register new user
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
Login user
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

Event Endpoints

GET /api/events/all
Get all events
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
Get upcoming events
Response: Same as /api/events/all but filtered

Booking Endpoints

POST /api/bookings/create
Create new booking (requires authentication)
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
Get user bookings (requires authentication)
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

Security Endpoints

GET /api/admin/security/status
Get security status (requires ADMIN role)
Headers: Authorization: Bearer {token}
Response:
{
  "timestamp": "2024-01-15T10:30:00",
  "securityLevel": "ENHANCED",
  "rateLimitingEnabled": true,
  "passwordValidationEnabled": true,
  "auditLoggingEnabled": true
}

Directory Structure
- src/main/java/com/example/ticketbooking
  - config: application and security configuration
  - controller: REST endpoints for auth, event, booking, monitoring
  - dto: data transfer objects
  - entity: database models
  - exception: global exception handler
  - repository: JPA data access
  - security: filters, JWT, audit, rate limit
  - service: business logic
- src/main/resources
  - static: HTML, CSS, JS files
  - application.properties: default configuration
  - application-prod.properties: production configuration

Security Implementation

JWT Authentication
- Token expiration: 24 hours (configurable)
- Algorithm: HS512
- Claims: username, issuedAt, expiration
- Validation: signature, expiration, format

Rate Limiting
- Login/Register: 10 requests per minute, 100 per hour
- IP-based tracking with sliding window
- Automatic cleanup of old entries
- HTTP 429 response when exceeded

Password Policy
- Minimum length: 8 characters
- Must contain: uppercase, lowercase, numbers, special characters
- BCrypt hashing with salt rounds
- Validation on registration and password change

Audit Logging
- Login attempts (success/failure)
- Registration attempts
- Unauthorized access attempts
- Rate limit violations
- Suspicious activity detection
- IP address tracking
- Timestamp logging

CORS Configuration
- Allowed origins: configurable via environment variables
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type
- Credentials: true

Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains

Performance Optimization

Database Optimization
- Connection pooling with HikariCP
- Batch processing for bulk operations
- Index optimization on frequently queried fields
- Query optimization with JPA/Hibernate

Caching Strategy
- In-memory caching for static data
- Session-based caching for user data
- Database query result caching

Monitoring and Logging

Application Metrics
- Request/response time tracking
- Error rate monitoring
- Database connection pool metrics
- Memory usage monitoring

Logging Strategy
- Structured logging with SLF4J
- Different log levels for different environments
- Security audit logging
- Performance logging
- Error logging with stack traces

Deployment Guide

Development Environment
1. Install Java 17 and Maven
2. Clone repository
3. Run: mvn spring-boot:run
4. Access: http://localhost:8080
5. H2 Console: http://localhost:8080/h2-console

Production Environment
1. Set environment variables:
   - JWT_SECRET: Strong secret key
   - JWT_EXPIRATION: Token expiration time
   - CORS_ALLOWED_ORIGINS: Allowed domains
   - DATABASE_URL: Production database URL
   - DATABASE_USERNAME: Database username
   - DATABASE_PASSWORD: Database password

2. Build application:
   mvn clean package -Pprod

3. Run with production profile:
   java -jar target/ticket-booking-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

Docker Deployment
1. Create Dockerfile:
   FROM openjdk:17-jre-slim
   COPY target/ticket-booking-0.0.1-SNAPSHOT.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "/app.jar"]

2. Build and run:
   docker build -t ticket-booking .
   docker run -p 8080:8080 ticket-booking

CI/CD Pipeline
1. Build stage: Maven compile and test
2. Security scan: Dependency vulnerability check
3. Quality gate: Code coverage and quality metrics
4. Build image: Docker image creation
5. Deploy: Automated deployment to staging/production

Testing Strategy

Unit Testing
- Service layer testing with Mockito
- Repository layer testing with @DataJpaTest
- Security testing with @WebMvcTest
- Integration testing with @SpringBootTest

API Testing
- Postman collections for all endpoints
- Automated API testing with RestAssured
- Performance testing with JMeter

Security Testing
- Penetration testing for common vulnerabilities
- JWT token validation testing
- Rate limiting testing
- Password policy testing

Production Checklist

Security Checklist
- JWT secret is properly configured
- CORS origins are restricted
- Rate limiting is enabled
- Audit logging is active
- Security headers are set
- Database credentials are secure
- HTTPS is enabled
- Error messages don't leak sensitive information

Performance Checklist
- Database indexes are optimized
- Connection pooling is configured
- Caching is implemented
- Logging levels are appropriate
- Memory settings are optimized
- Garbage collection is tuned

Monitoring Checklist
- Application health checks are configured
- Metrics collection is active
- Alerting is set up
- Log aggregation is working
- Database monitoring is active
- Security monitoring is enabled

Troubleshooting

Common Issues
1. JWT token expired: Check token expiration time
2. Rate limit exceeded: Wait for rate limit window to reset
3. Database connection issues: Check connection pool settings
4. CORS errors: Verify allowed origins configuration
5. Password validation failed: Check password policy requirements

Debug Mode
Enable debug logging in application.properties:
logging.level.com.example.ticketbooking=DEBUG
logging.level.org.springframework.security=DEBUG

Performance Issues
- Check database query performance
- Monitor memory usage
- Review connection pool settings
- Analyze slow request logs

Security Issues
- Review security audit logs
- Check for failed login attempts
- Monitor rate limit violations
- Verify JWT token validation

Getting Started
1. Ensure Java 17 and Maven are installed
2. Clone this repository
3. Run the following command in terminal
   mvn spring-boot:run
4. Access the application at http://localhost:8080
5. For production database, adjust configuration in application-prod.properties

Default Account
Check on UserServiceClass

Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request
5. Ensure code review and CI checks pass

Changelog
- v1.0.0: Initial release with basic booking functionality
- v1.1.0: Added security features and audit logging
- v1.2.0: Enhanced performance and monitoring
- v1.3.0: Added Docker support and CI/CD pipeline

Notes
- For production security, ensure environment variables JWT_SECRET, JWT_EXPIRATION, and CORS_ALLOWED_ORIGINS are properly configured
- Replace H2 database with production database in production environment
- Regularly check security audit logs
- Monitor performance metrics regularly
- Update dependencies regularly for security patches

License
Please add license as needed
