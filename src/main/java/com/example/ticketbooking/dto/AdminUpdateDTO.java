package com.example.ticketbooking.dto;

import lombok.Data;

@Data
public class AdminUpdateDTO {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String department;
    private String emergencyContact;
    private String emergencyPhone;
    private String workSchedule;
    private String officeLocation;
    private String supervisor;
    private String notes;
    private String profileImage;
}
