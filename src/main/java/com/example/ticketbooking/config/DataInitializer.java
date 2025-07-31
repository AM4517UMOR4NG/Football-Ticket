package com.example.ticketbooking.config;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.dto.LeagueDTO;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.LeagueRepository;
import com.example.ticketbooking.service.EventService;
import com.example.ticketbooking.service.LeagueService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

        private final EventService eventService;
        private final EventRepository eventRepository;
        private final LeagueService leagueService;
        private final LeagueRepository leagueRepository;

        public DataInitializer(EventService eventService, EventRepository eventRepository,
                        LeagueService leagueService, LeagueRepository leagueRepository) {
                this.eventService = eventService;
                this.eventRepository = eventRepository;
                this.leagueService = leagueService;
                this.leagueRepository = leagueRepository;
        }

        @Override
        public void run(String... args) throws Exception {
                // Admin user is now created in UserService.initDefaultAdmin()
                if (leagueRepository.count() == 0) {
                        createLeagues();
                }
                if (eventRepository.count() == 0) {
                        createFootballEvents();
                }
        }

        private void createLeagues() {
                // Premier League
                LeagueDTO premierLeague = new LeagueDTO(
                                null,
                                "Premier League",
                                "The Premier League is the top level of the English football league system. Contested by 20 clubs, it operates on a system of promotion and relegation with the English Football League.",
                                "England",
                                1992,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                20,
                                "August",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(premierLeague);

                // La Liga
                LeagueDTO laLiga = new LeagueDTO(
                                null,
                                "La Liga",
                                "La Liga is the men's top professional football division of the Spanish football league system. It is contested by 20 teams, with the three lowest-placed teams relegated to the Segunda División.",
                                "Spain",
                                1929,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                20,
                                "August",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(laLiga);

                // Bundesliga
                LeagueDTO bundesliga = new LeagueDTO(
                                null,
                                "Bundesliga",
                                "The Bundesliga is a professional association football league in Germany. At the top of the German football league system, the Bundesliga is Germany's primary football competition.",
                                "Germany",
                                1963,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                18,
                                "August",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(bundesliga);

                // Serie A
                LeagueDTO serieA = new LeagueDTO(
                                null,
                                "Serie A",
                                "Serie A is a professional league competition for football clubs located at the top of the Italian football league system and the winner is awarded the Coppa Campioni d'Italia.",
                                "Italy",
                                1898,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                20,
                                "August",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(serieA);

                // Ligue 1
                LeagueDTO ligue1 = new LeagueDTO(
                                null,
                                "Ligue 1",
                                "Ligue 1 is a French professional league for men's association football clubs. At the top of the French football league system, it is the country's primary football competition.",
                                "France",
                                1932,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                20,
                                "August",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(ligue1);

                // Champions League
                LeagueDTO championsLeague = new LeagueDTO(
                                null,
                                "UEFA Champions League",
                                "The UEFA Champions League is an annual club football competition organised by the Union of European Football Associations and contested by top-division European clubs.",
                                "Europe",
                                1955,
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
                                32,
                                "September",
                                "May",
                                "ACTIVE",
                                null,
                                null);
                leagueService.createLeague(championsLeague);

                System.out.println("FootballTix leagues created successfully!");
        }

        private void createFootballEvents() {
                // Featured Premier League Matches (as shown in index.html)
                
                // Match 1: Manchester United vs Liverpool
                EventDTO event1 = new EventDTO(
                                null,
                                "Manchester United vs Liverpool",
                                "The biggest rivalry in English football! Watch the Red Devils take on the Reds in this epic Premier League clash. " +
                                                "Old Trafford will be electric as these two historic clubs battle for supremacy. " +
                                                "Don't miss this classic encounter between two of England's most successful clubs!",
                                "Old Trafford, Manchester",
                                LocalDateTime.now().plusDays(15).withHour(16).withMinute(30),
                                75000,
                                new BigDecimal("95.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event1);

                // Match 2: Chelsea vs Arsenal
                EventDTO event2 = new EventDTO(
                                null,
                                "Chelsea vs Arsenal",
                                "London derby at its finest! Chelsea host Arsenal in a Premier League showdown that promises goals and drama. " +
                                                "Stamford Bridge will be packed as these London giants fight for crucial points. " +
                                                "Experience the passion of London football at its best!",
                                "Stamford Bridge, London",
                                LocalDateTime.now().plusDays(21).withHour(15).withMinute(0),
                                40000,
                                new BigDecimal("85.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event2);

                // Match 3: Manchester City vs Tottenham
                EventDTO event3 = new EventDTO(
                                null,
                                "Manchester City vs Tottenham",
                                "Premier League title contenders clash! Manchester City face Tottenham in a match that could decide the title race. " +
                                                "The Etihad Stadium will witness top-class football as these two attacking teams go head-to-head. " +
                                                "A must-watch match for any football fan!",
                                "Etihad Stadium, Manchester",
                                LocalDateTime.now().plusDays(22).withHour(14).withMinute(0),
                                55000,
                                new BigDecimal("75.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event3);

                // La Liga Matches
                EventDTO event4 = new EventDTO(
                                null,
                                "Real Madrid vs Barcelona",
                                "El Clásico! The most prestigious match in world football. Real Madrid host Barcelona in this legendary La Liga encounter. " +
                                                "The Santiago Bernabéu will be packed with 90,000 fans as these Spanish giants battle for supremacy. " +
                                                "Witness football history in the making!",
                                "Santiago Bernabéu, Madrid",
                                LocalDateTime.now().plusDays(25).withHour(20).withMinute(0),
                                90000,
                                new BigDecimal("150.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event4);

                EventDTO event5 = new EventDTO(
    null,
    "Atletico Madrid vs Sevilla",
    "Madrid derby action! Atletico Madrid take on Sevilla in an exciting La Liga match. " +
    "The Wanda Metropolitano will be rocking as these two competitive teams fight for European spots. " +
    "Experience the passion of Spanish football!",
    "Wanda Metropolitano, Madrid",
    LocalDateTime.now().plusDays(18).withHour(19).withMinute(30),
    68000,
    new BigDecimal("65.00"),
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    null
);
                eventService.createEvent(event5);

                // Bundesliga Matches
                EventDTO event6 = new EventDTO(
                                null,
                                "Bayern Munich vs Borussia Dortmund",
                                "Der Klassiker! Germany's biggest rivalry. Bayern Munich face Borussia Dortmund in this Bundesliga classic. " +
                                                "The Allianz Arena will be packed as these German powerhouses battle for the title. " +
                                                "Witness the best of German football!",
                                "Allianz Arena, Munich",
                                LocalDateTime.now().plusDays(30).withHour(20).withMinute(30),
                                75000,
                                new BigDecimal("120.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event6);

                EventDTO event7 = new EventDTO(
                                null,
                                "RB Leipzig vs Bayer Leverkusen",
                                "Top Bundesliga clash! RB Leipzig host Bayer Leverkusen in an exciting match between two rising German clubs. " +
                                                "The Red Bull Arena will witness fast-paced, attacking football. " +
                                                "Don't miss this thrilling encounter!",
                                "Red Bull Arena, Leipzig",
                                LocalDateTime.now().plusDays(12).withHour(17).withMinute(30),
                                47000,
                                new BigDecimal("55.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event7);

                // Serie A Matches
                EventDTO event8 = new EventDTO(
                                null,
                                "AC Milan vs Inter Milan",
                                "Derby della Madonnina! The Milan derby is one of football's greatest spectacles. " +
                                                "AC Milan face Inter Milan in this Serie A classic at the iconic San Siro. " +
                                                "Experience the passion and intensity of Italian football's biggest rivalry!",
                                "San Siro, Milan",
                                LocalDateTime.now().plusDays(28).withHour(20).withMinute(45),
                                80000,
                                new BigDecimal("110.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event8);

                EventDTO event9 = new EventDTO(
                                null,
                                "Juventus vs Napoli",
                                "Italian football giants clash! Juventus host Napoli in a Serie A match that could decide the title race. " +
                                                "The Allianz Stadium will be packed as these two historic clubs battle for supremacy. " +
                                                "Witness the best of Italian football!",
                                "Allianz Stadium, Turin",
                                LocalDateTime.now().plusDays(35).withHour(20).withMinute(30),
                                41000,
                                new BigDecimal("95.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event9);

                // Ligue 1 Matches
                EventDTO event10 = new EventDTO(
                                null,
                                "Paris Saint-Germain vs Marseille",
                                "Le Classique! France's biggest rivalry. PSG face Marseille in this Ligue 1 classic. " +
                                                "The Parc des Princes will be electric as these French giants battle for supremacy. " +
                                                "Experience the passion of French football!",
                                "Parc des Princes, Paris",
                                LocalDateTime.now().plusDays(32).withHour(21).withMinute(0),
                                48000,
                                new BigDecimal("130.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event10);

                EventDTO event11 = new EventDTO(
                                null,
                                "Lyon vs Monaco",
                                "French football excellence! Lyon host Monaco in an exciting Ligue 1 encounter. " +
                                                "The Groupama Stadium will witness top-class football as these competitive teams battle for European spots. " +
                                                "Don't miss this thrilling match!",
                                "Groupama Stadium, Lyon",
                                LocalDateTime.now().plusDays(19).withHour(20).withMinute(0),
                                59000,
                                new BigDecimal("70.00"),
                                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                                null);
                eventService.createEvent(event11);
// Champions League Matches
EventDTO event12 = new EventDTO(
    null,
    "Real Madrid vs Manchester City",
    "Champions League Quarter-Final! European football's elite clash as Real Madrid face Manchester City. " +
    "The Santiago Bernabéu will host this epic Champions League encounter. " +
    "Witness the best of European football in this must-see match!",
    "Santiago Bernabéu, Madrid",
    LocalDateTime.now().plusDays(45).withHour(21).withMinute(0),
    90000,
    new BigDecimal("200.00"),
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    null
);
eventService.createEvent(event12);

                System.out.println("FootballTix events created successfully! All major leagues covered.");
        }
}