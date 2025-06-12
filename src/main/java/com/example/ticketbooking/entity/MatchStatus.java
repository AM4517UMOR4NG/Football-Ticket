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

