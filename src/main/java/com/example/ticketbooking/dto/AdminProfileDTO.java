package com.example.ticketbooking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String role;
    private String department;
    private String adminLevel;
    private String permissions;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    private String profileImage;
    private String emergencyContact;
    private String emergencyPhone;
    private String workSchedule;
    private String officeLocation;
    private String employeeId;
    private String supervisor;
    private String notes;

    // System statistics
    private Long totalUsers;
    private Long activeEvents;
    private Double totalRevenue;
    private String systemStatus;
    private Long totalBookings;
    private Long pendingBookings;
    private Long completedBookings;
    private Long cancelledBookings;

    // Admin activity
    private Long actionsPerformed;
    private Long usersManaged;
    private Long eventsManaged;
    private Long systemLogins;
    private LocalDateTime lastAction;
    private String lastActionType;
}
