package com.example.ticketbooking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "matches")
public class Match {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nama pertandingan tidak boleh kosong")
    @Size(min = 3, max = 100, message = "Nama pertandingan harus antara 3-100 karakter")
    @Column(name = "match_name", length = 100, nullable = false)
    private String matchName;
    
    @NotBlank(message = "Tim tuan rumah tidak boleh kosong")
    @Size(min = 2, max = 50, message = "Nama tim harus antara 2-50 karakter")
    @Column(name = "home_team", length = 50, nullable = false)
    private String homeTeam;
    
    @NotBlank(message = "Tim tamu tidak boleh kosong")
    @Size(min = 2, max = 50, message = "Nama tim harus antara 2-50 karakter")
    @Column(name = "away_team", length = 50, nullable = false)
    private String awayTeam;
    
    @NotNull(message = "Tanggal pertandingan tidak boleh kosong")
    @Future(message = "Tanggal pertandingan harus di masa depan")
    @Column(name = "match_date", nullable = false)
    private LocalDateTime matchDate;
    
    @NotBlank(message = "Venue tidak boleh kosong")
    @Size(min = 5, max = 100, message = "Venue harus antara 5-100 karakter")
    @Column(name = "venue", length = 100, nullable = false)
    private String venue;
    
    @NotNull(message = "Harga tiket tidak boleh kosong")
    @DecimalMin(value = "0.0", inclusive = false, message = "Harga tiket harus lebih dari 0")
    @Digits(integer = 10, fraction = 2, message = "Format harga tidak valid")
    @Column(name = "ticket_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal ticketPrice;
    
    @NotNull(message = "Kapasitas tidak boleh kosong")
    @Min(value = 1, message = "Kapasitas minimal 1")
    @Max(value = 100000, message = "Kapasitas maksimal 100,000")
    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    
    @Min(value = 0, message = "Tiket terjual tidak boleh negatif")
    @Column(name = "tickets_sold", nullable = false)
    private Integer ticketsSold = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private MatchStatus status = MatchStatus.SCHEDULED;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 20, nullable = false)
    private MatchCategory category;
    
    @Size(max = 500, message = "Deskripsi maksimal 500 karakter")
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by", length = 50)
    private String createdBy;
    
    // Rules Business Logic Fields
    @Column(name = "min_age", nullable = false)
    private Integer minAge = 0;
    
    @Column(name = "max_tickets_per_user", nullable = false)
    private Integer maxTicketsPerUser = 4;
    
    @Column(name = "booking_deadline", nullable = false)
    private LocalDateTime bookingDeadline;
    
    @Column(name = "refund_allowed", nullable = false)
    private Boolean refundAllowed = true;
    
    @Column(name = "refund_deadline")
    private LocalDateTime refundDeadline;
    
    // Constructors
    public Match() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Match(String matchName, String homeTeam, String awayTeam, 
                LocalDateTime matchDate, String venue, BigDecimal ticketPrice, 
                Integer capacity, MatchCategory category) {
        this();
        this.matchName = matchName;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.matchDate = matchDate;
        this.venue = venue;
        this.ticketPrice = ticketPrice;
        this.capacity = capacity;
        this.category = category;
        this.setBookingDeadlineFromMatchDate();
        this.setRefundDeadlineFromMatchDate();
    }
    
    // Business Logic Methods
    public boolean isBookingOpen() {
        return status == MatchStatus.SCHEDULED && 
               LocalDateTime.now().isBefore(bookingDeadline) &&
               ticketsSold < capacity;
    }
    
    public boolean isRefundAllowed() {
        return refundAllowed && 
               LocalDateTime.now().isBefore(refundDeadline);
    }
    
    public Integer getAvailableTickets() {
        return capacity - ticketsSold;
    }
    
    public boolean canBookTickets(Integer requestedTickets) {
        return isBookingOpen() && 
               requestedTickets > 0 && 
               requestedTickets <= maxTicketsPerUser &&
               requestedTickets <= getAvailableTickets();
    }
    
    public BigDecimal getTotalPrice(Integer tickets) {
        return ticketPrice.multiply(BigDecimal.valueOf(tickets));
    }
    
    public Double getBookingPercentage() {
        return (ticketsSold.doubleValue() / capacity.doubleValue()) * 100;
    }
    
    public void setBookingDeadlineFromMatchDate() {
        if (matchDate != null) {
            this.bookingDeadline = matchDate.minusHours(2); // 2 jam sebelum match
        }
    }
    
    public void setRefundDeadlineFromMatchDate() {
        if (matchDate != null) {
            this.refundDeadline = matchDate.minusDays(1); // 1 hari sebelum match
        }
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bookingDeadline == null) {
            setBookingDeadlineFromMatchDate();
        }
        if (refundDeadline == null) {
            setRefundDeadlineFromMatchDate();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMatchName() { return matchName; }
    public void setMatchName(String matchName) { this.matchName = matchName; }
    
    public String getHomeTeam() { return homeTeam; }
    public void setHomeTeam(String homeTeam) { this.homeTeam = homeTeam; }
    
    public String getAwayTeam() { return awayTeam; }
    public void setAwayTeam(String awayTeam) { this.awayTeam = awayTeam; }
    
    public LocalDateTime getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDateTime matchDate) { 
        this.matchDate = matchDate;
        setBookingDeadlineFromMatchDate();
        setRefundDeadlineFromMatchDate();
    }
    
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    
    public BigDecimal getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public Integer getTicketsSold() { return ticketsSold; }
    public void setTicketsSold(Integer ticketsSold) { this.ticketsSold = ticketsSold; }
    
    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }
    
    public MatchCategory getCategory() { return category; }
    public void setCategory(MatchCategory category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }
    
    public Integer getMaxTicketsPerUser() { return maxTicketsPerUser; }
    public void setMaxTicketsPerUser(Integer maxTicketsPerUser) { this.maxTicketsPerUser = maxTicketsPerUser; }
    
    public LocalDateTime getBookingDeadline() { return bookingDeadline; }
    public void setBookingDeadline(LocalDateTime bookingDeadline) { this.bookingDeadline = bookingDeadline; }
    
    public Boolean getRefundAllowed() { return refundAllowed; }
    public void setRefundAllowed(Boolean refundAllowed) { this.refundAllowed = refundAllowed; }
    
    public LocalDateTime getRefundDeadline() { return refundDeadline; }
    public void setRefundDeadline(LocalDateTime refundDeadline) { this.refundDeadline = refundDeadline; }
}