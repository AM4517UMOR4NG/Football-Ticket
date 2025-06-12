package com.example.ticketbooking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequestDTO {
    @NotNull(message = "ID acara tidak boleh kosong")
    private Long eventId;
    
    @NotNull(message = "Jumlah tiket tidak boleh kosong")
    @Min(value = 1, message = "Jumlah tiket minimal 1")
    @Max(value = 10, message = "Jumlah tiket maksimal 10 per pemesanan")
    private Integer numberOfTickets;
}