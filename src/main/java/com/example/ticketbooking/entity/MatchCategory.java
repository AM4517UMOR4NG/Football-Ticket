package com.example.ticketbooking.entity;

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