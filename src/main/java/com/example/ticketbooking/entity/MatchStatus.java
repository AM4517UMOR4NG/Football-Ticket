package com.example.ticketbooking.entity;


// MatchStatus.java
public enum MatchStatus {
    SCHEDULED("Terjadwal"),
    LIVE("Sedang Berlangsung"),
    FINISHED("Selesai"),
    CANCELLED("Dibatalkan"),
    POSTPONED("Ditunda");
    
    private final String displayName;
    
    MatchStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

// MatchCategory.java
public enum MatchCategory {
    FOOTBALL("Sepak Bola", "⚽"),
    BASKETBALL("Basket Ball", "🏀"),
    VOLLEYBALL("Voli", "🏐"),
    TENNIS("Tenis", "🎾"),
    BADMINTON("Bulu Tangkis", "🏸"),
    ESPORTS("E-Sports", "🎮"),
    BOXING("Tinju", "🥊"),
    MMA("Mixed Martial Arts", "🥋"),
    CRICKET("Kriket", "🏏"),
    BASEBALL("Baseball", "⚾");
    
    private final String displayName;
    private final String icon;
    
    MatchCategory(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getIcon() {
        return icon;
    }
}