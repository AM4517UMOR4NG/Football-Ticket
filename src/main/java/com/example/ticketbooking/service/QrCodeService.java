package com.example.ticketbooking.service;

import com.example.ticketbooking.entity.Booking;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.Map;

@Service
public class QrCodeService {

    public String buildTicketPayload(Booking booking) {
        Long eventId = booking.getEvent() != null ? booking.getEvent().getId() : 0L;
        String status = booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN";
        return String.format(
                "FOOTBALLTIX|REF:%s|EVENT:%d|QTY:%d|STATUS:%s",
                booking.getBookingReference(),
                eventId,
                booking.getNumberOfTickets(),
                status);
    }

    public byte[] generateQrCodePng(String payload, int size) {
        int clampedSize = Math.max(120, Math.min(size, 600));
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 2);

        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(payload, BarcodeFormat.QR_CODE, clampedSize, clampedSize, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new IllegalStateException("Failed to generate QR code", e);
        }
    }
}
