package com.example.ticketbooking.service;

import com.example.ticketbooking.entity.Booking;
import com.midtrans.Config;
import com.midtrans.ConfigFactory;
import com.midtrans.httpclient.error.MidtransError;
import com.midtrans.service.MidtransSnapApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
public class MidtransService {

    private static final Logger logger = LoggerFactory.getLogger(MidtransService.class);

    @Value("${midtrans.server-key}")
    private String serverKey;

    @Value("${midtrans.client-key}")
    private String clientKey;

    @Value("${midtrans.is-production:false}")
    private boolean isProduction;

    private MidtransSnapApi snapApi;
    private com.midtrans.service.MidtransCoreApi coreApi;

    @PostConstruct
    public void init() {
        try {
            Config config = Config.builder()
                    .setServerKey(serverKey)
                    .setClientKey(clientKey)
                    .setIsProduction(isProduction)
                    .build();
            ConfigFactory factory = new ConfigFactory(config);
            snapApi = factory.getSnapApi();
            coreApi = factory.getCoreApi();
            logger.info("Midtrans API initialized (production={})", isProduction);
        } catch (Exception e) {
            logger.error("Failed to initialize Midtrans: {}", e.getMessage());
        }
    }

    public org.json.JSONObject checkTransactionStatus(String orderId) throws MidtransError {
        return coreApi.checkTransaction(orderId);
    }

    public Map<String, String> createSnapTransaction(Booking booking) throws MidtransError {
        Map<String, Object> params = new HashMap<>();

        // Transaction details
        Map<String, String> transactionDetails = new HashMap<>();
        transactionDetails.put("order_id", booking.getBookingReference());
        transactionDetails.put("gross_amount", String.valueOf(booking.getTotalAmount().intValue()));
        params.put("transaction_details", transactionDetails);

        // Customer details
        Map<String, String> customerDetails = new HashMap<>();
        if (booking.getUser() != null) {
            customerDetails.put("first_name", booking.getUser().getFullName() != null
                    ? booking.getUser().getFullName()
                    : booking.getUser().getUsername());
            customerDetails.put("email", booking.getUser().getEmail());
        }
        params.put("customer_details", customerDetails);

        // Item details
        List<Map<String, String>> itemDetails = new ArrayList<>();
        Map<String, String> item = new HashMap<>();
        item.put("id", "TICKET-" + booking.getEvent().getId());
        item.put("price", String.valueOf(booking.getEvent().getPrice().intValue()));
        item.put("quantity", String.valueOf(booking.getNumberOfTickets()));
        item.put("name", truncate(booking.getEvent().getTitle(), 50));
        itemDetails.add(item);
        params.put("item_details", itemDetails);

        // Callbacks
        Map<String, String> callbacks = new HashMap<>();
        callbacks.put("finish", "http://localhost:8080/bookings.html");
        params.put("callbacks", callbacks);

        logger.info("Creating Snap transaction for order: {}", booking.getBookingReference());
        String snapToken = snapApi.createTransactionToken(params);

        Map<String, String> result = new HashMap<>();
        result.put("token", snapToken);
        result.put("redirect_url", isProduction
                ? "https://app.midtrans.com/snap/v2/vtweb/" + snapToken
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/" + snapToken);

        logger.info("Snap token created successfully: {}",
                snapToken.substring(0, Math.min(10, snapToken.length())) + "...");
        return result;
    }

    public String getClientKey() {
        return clientKey;
    }

    private String truncate(String str, int maxLen) {
        if (str == null)
            return "";
        return str.length() <= maxLen ? str : str.substring(0, maxLen);
    }
}
