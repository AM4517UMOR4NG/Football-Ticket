# First part of my project

# ⚽ Football Ticket Booking System

<div align="center">
  <img src="https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java" alt="Java 17">
  <img src="https://img.shields.io/badge/Spring_Boot-3-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot 3">
  <img src="https://img.shields.io/badge/Security-JWT-blue?style=for-the-badge&logo=json-web-tokens" alt="JWT">
  <img src="https://img.shields.io/badge/Database-H2-lightblue?style=for-the-badge&logo=h2" alt="H2 Database">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</div>

<div align="center">
  <h3>🎫 Modern, Secure, and Scalable Football Match Ticket Booking Platform</h3>
  <p><em>Built with Spring Boot 3, featuring enterprise-grade security and performance optimization</em></p>
</div>

---

## 🌟 Why Choose This System?

<table>
<tr>
<td width="50%">

### 🔐 **Enterprise Security**
- **JWT Authentication** with 24-hour expiration
- **Rate Limiting** (10 req/min) to prevent attacks
- **BCrypt Password Hashing** with strong policy
- **Security Audit Logging** for complete traceability
- **CORS Protection** with configurable origins

</td>
<td width="50%">

### ⚡ **High Performance**
- **HikariCP Connection Pooling** for optimal DB performance
- **In-Memory Caching** for faster response times
- **Batch Processing** for bulk operations
- **Database Indexing** for quick queries
- **Production-Ready** architecture

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
```bash
☑️ Java 17+
☑️ Maven 3.6+
☑️ Git
```

### 🏃‍♂️ Run in 3 Steps
```bash
# 1. Clone the repository
git clone https://github.com/AM4517UMOR4NG/Football-Ticket.git

# 2. Navigate to project directory
cd Football-Ticket

# 3. Run the application
mvn spring-boot:run
```

### 🎯 Access Points
- **Main Application**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
- **API Documentation**: Available via endpoints below

---

## 🎨 Key Features

<div align="center">
<table>
<tr>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🔐-Authentication-blue?style=for-the-badge">
<br><strong>Secure Registration & Login</strong>
<br>JWT-based authentication with robust password policies
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🎫-Booking-green?style=for-the-badge">
<br><strong>Easy Ticket Booking</strong>
<br>Intuitive booking process with real-time seat availability
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/📊-Management-orange?style=for-the-badge">
<br><strong>Event Management</strong>
<br>Comprehensive event creation and management system
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🛡️-Security-red?style=for-the-badge">
<br><strong>Security Monitoring</strong>
<br>Real-time security auditing and threat detection
</td>
</tr>
</table>
</div>

---

## 📋 API Reference

### 🔐 Authentication Endpoints

<details>
<summary><strong>POST /api/auth/register</strong> - Register New User</summary>

**Request:**
```json
{
  "username": "footballfan",
  "email": "fan@example.com",
  "password": "SecurePass123!",
  "fullName": "Ronaldo The GOAT",
  "phoneNumber": "081234567890",
  "role": "USER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```
</details>

<details>
<summary><strong>POST /api/auth/login</strong> - User Login</summary>

**Request:**
```json
{
  "username": "footballfan",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "footballfan",
  "email": "fan@example.com",
  "fullName": "Ronaldo The GOAT"
}
```
</details>

### 🎫 Event & Booking Endpoints

<details>
<summary><strong>GET /api/events/all</strong> - Get All Events</summary>

**Response:**
```json
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
```
</details>

<details>
<summary><strong>POST /api/bookings/create</strong> - Create Booking</summary>

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "eventId": 1,
  "numberOfTickets": 2
}
```

**Response:**
```json
{
  "id": 1,
  "bookingReference": "BK20240115001",
  "eventTitle": "Persija vs Persib",
  "numberOfTickets": 2,
  "totalAmount": 190000,
  "status": "CONFIRMED"
}
```
</details>

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Controller    │    │   Service       │
│   (HTML/CSS/JS) │◄──►│   Layer         │◄──►│   Layer         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Security      │    │   Repository    │    │   Database      │
│   Filters       │    │   Layer         │◄──►│   (H2/MySQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛠️ Technology Stack

<div align="center">
<table>
<tr>
<td align="center"><strong>Backend</strong></td>
<td align="center"><strong>Security</strong></td>
<td align="center"><strong>Database</strong></td>
<td align="center"><strong>Frontend</strong></td>
</tr>
<tr>
<td align="center">
Java 17<br>
Spring Boot 3<br>
Spring Data JPA<br>
Maven<br>
Lombok
</td>
<td align="center">
Spring Security<br>
JWT (jsonwebtoken)<br>
BCrypt<br>
Rate Limiting<br>
CORS
</td>
<td align="center">
H2 Database<br>
HikariCP<br>
JPA/Hibernate<br>
Database Indexing
</td>
<td align="center">
HTML5<br>
CSS3<br>
JavaScript<br>
Responsive Design
</td>
</tr>
</table>
</div>

---

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t football-ticket-booking .

# Run container
docker run -p 8080:8080 football-ticket-booking
```

**Dockerfile:**
```dockerfile
FROM openjdk:17-jre-slim
COPY target/ticket-booking-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Security
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Database (Production)
DATABASE_URL=jdbc:postgresql://localhost:5432/football_tickets
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
```

### Production Deployment
```bash
# Build for production
mvn clean package -Pprod

# Run with production profile
java -jar target/ticket-booking-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

---

## 📊 Performance & Monitoring

### Key Metrics Tracked:
- ⏱️ **Request Response Times**
- 📈 **Error Rates**
- 🔌 **Database Connections**
- 💾 **Memory Usage**
- 🔐 **Security Events**

### Logging Levels:
```properties
# Debug mode
logging.level.com.example.ticketbooking=DEBUG
logging.level.org.springframework.security=DEBUG
```

---

## 🧪 Testing

### Test Coverage:
- ✅ **Unit Tests** with Mockito
- ✅ **Integration Tests** with @SpringBootTest
- ✅ **Security Tests** with @WebMvcTest
- ✅ **API Tests** with RestAssured
- ✅ **Performance Tests** with JMeter

### Running Tests:
```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report
```

---

## 🚀 Production Checklist

### Security ✅
- [ ] JWT secret configured
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Security headers set

### Performance ✅
- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Caching implemented
- [ ] Memory settings tuned

### Monitoring ✅
- [ ] Health checks configured
- [ ] Metrics collection active
- [ ] Alerting set up
- [ ] Log aggregation working

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and test thoroughly
4. **Submit** a pull request

### Development Guidelines:
- Follow Java coding standards
- Write comprehensive tests
- Update documentation
- Ensure security best practices

---

## 📈 Roadmap

### Version 1.4.0 (Upcoming)
- [ ] 🔔 Real-time notifications
- [ ] 💳 Payment gateway integration
- [ ] 📱 Mobile app API
- [ ] 🎨 Advanced UI/UX

### Version 1.5.0 (Future)
- [ ] 🌐 Multi-language support
- [ ] 📊 Advanced analytics
- [ ] 🤖 AI-powered recommendations
- [ ] ⚡ Microservices architecture

---

## 📞 Support & Contact

<div align="center">
<table>
<tr>
<td align="center">
<strong>📧 Email</strong><br>
<a href="mailto:aekmohop@gmail.com">aekmohop@gmail.com</a>
</td>
<td align="center">
<strong>🐛 Issues</strong><br>
<a href="https://github.com/AM4517UMOR4NG/Football-Ticket/issues">Report Bug</a>
</td>
<td align="center">
<strong>💡 Feature Request</strong><br>
<a href="https://github.com/AM4517UMOR4NG/Football-Ticket/issues">Request Feature</a>
</td>
</tr>
</table>
</div>

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
<h3>________________________________________________________________________________________</h3>
<p>Made with by <a href="https://github.com/AM4517UMOR4NG">AM4517UMOR4NG</a></p>
</div>

---

<div align="center">
<img src="https://img.shields.io/badge/🚀-Production_Ready-brightgreen?style=for-the-badge" alt="Production Ready">
<img src="https://img.shields.io/badge/🔒-Security_First-red?style=for-the-badge" alt="Security First">
<img src="https://img.shields.io/badge/⚡-High_Performance-yellow?style=for-the-badge" alt="High Performance">
</div>


_________________________________________________________________________________________________
                                                                                                
                                                                                                
                                                                                                
                                                                                                
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
_________________________________________________________________________________________________

