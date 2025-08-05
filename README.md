# FootballTix - Football Ticket Booking System

A comprehensive football ticket booking platform built with Spring Boot and modern web technologies.

## Features

### 🏆 League Management
- **Dynamic League Loading**: Leagues are loaded dynamically from the backend API
- **League Filtering**: Filter events by specific leagues (Premier League, La Liga, Bundesliga, etc.)
- **League Details**: View detailed information about each league including teams, founding year, and season dates
- **League Statistics**: Track league performance and event counts

### 🎫 Event Management with Attractive Images
- **Event Images**: Each event now displays attractive football images from Unsplash
- **Image Fallback**: Graceful fallback to default styling when images fail to load
- **Hover Effects**: Smooth image scaling and transition effects on hover
- **Responsive Design**: Images adapt to different screen sizes

### 🎨 Enhanced UI/UX
- **Modern Card Design**: Redesigned event cards with image headers
- **League Badges**: Visual indicators for different leagues
- **Date Badges**: Clear date display on event cards
- **Team Icons**: Visual representation of competing teams
- **Smooth Animations**: Hover effects and transitions throughout the interface

### 🔍 Advanced Search & Filtering
- **League-based Filtering**: Filter events by specific leagues
- **Date Filtering**: Search events by specific dates
- **Text Search**: Search events by title, description, or venue
- **Combined Filters**: Use multiple filters simultaneously

### 📊 Statistics Dashboard
- **Event Statistics**: Total events, upcoming events, available seats, average prices
- **League Statistics**: Total leagues, active leagues, total teams, total events
- **Real-time Updates**: Statistics update dynamically based on current data

## Technology Stack

### Backend
- **Spring Boot 3.x**: Main application framework
- **Spring Data JPA**: Database operations
- **Spring Security**: Authentication and authorization
- **JWT**: Token-based authentication
- **H2 Database**: In-memory database for development
- **Maven**: Dependency management

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Tailwind CSS
- **JavaScript (ES6+)**: Dynamic functionality
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- Modern web browser

### Installation

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd Football-Ticket-I
```

2. **Run the application**
```bash
mvn spring-boot:run
```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:8080`
   - The application will automatically initialize with sample data

### Sample Data

The application comes with pre-loaded sample data including:

#### Leagues
- Premier League (England)
- La Liga (Spain)
- Bundesliga (Germany)
- Serie A (Italy)
- Ligue 1 (France)
- UEFA Champions League (Europe)

#### Events
- 12 sample football matches across all major leagues
- Each event includes attractive images, detailed descriptions, and pricing
- Events are scheduled for upcoming dates

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/featured` - Get featured events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/{id}` - Get event by ID
- `GET /api/events/league/{league}` - Get events by league
- `GET /api/events/search` - Search events
- `GET /api/events/stats` - Get event statistics

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/active` - Get active leagues
- `GET /api/leagues/{id}` - Get league by ID
- `GET /api/leagues/search` - Search leagues
- `GET /api/leagues/{id}/events/count` - Get event count by league

## Key Features Implementation

### League Loading
```javascript
async function loadLeagues() {
    try {
        const response = await fetch(`${API_BASE_URL}/leagues`);
        const leagues = await response.json();
        populateLeagueFilter(leagues);
    } catch (error) {
        // Fallback to static leagues
        populateLeagueFilter(getStaticLeagues());
    }
}
```

### Event Images
```javascript
function displayEvents(events) {
    return events.map(event => `
        <div class="match-card">
            <div class="relative h-48">
                ${event.imageUrl ? `
                    <img src="${event.imageUrl}" alt="${event.title}" 
                         class="w-full h-full object-cover transition-transform duration-300 hover:scale-110">
                ` : `
                    <div class="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800">
                        <!-- Fallback content -->
                    </div>
                `}
            </div>
        </div>
    `).join('');
}
```

## Database Schema

### Event Entity
```java
@Entity
public class Event {
    private Long id;
    private String title;
    private String description;
    private String venue;
    private LocalDateTime eventDate;
    private Integer totalSeats;
    private BigDecimal price;
    private String imageUrl;  // New field for event images
    private League league;
}
```

### League Entity
```java
@Entity
public class League {
    private Long id;
    private String name;
    private String description;
    private String country;
    private Integer foundedYear;
    private String logoUrl;
    private String bannerUrl;
    private Integer totalTeams;
    private String seasonStart;
    private String seasonEnd;
    private LeagueStatus status;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact:
- Email: aekmohop@gmail.com

---

**FootballTix** - Sui

