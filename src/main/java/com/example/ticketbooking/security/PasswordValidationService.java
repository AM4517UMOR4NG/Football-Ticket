package com.example.ticketbooking.security;

import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PasswordValidationService {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final Pattern HAS_UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern HAS_LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern HAS_NUMBER = Pattern.compile("\\d");
    private static final Pattern HAS_SPECIAL_CHAR = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");
    private static final Pattern NO_COMMON_PASSWORDS = Pattern.compile(
            "^(?!.*(password|123456|qwerty|admin|user|test|guest|welcome|login|abc123|password123|admin123|user123)).*$",
            Pattern.CASE_INSENSITIVE);

    public PasswordValidationResult validatePassword(String password) {
        PasswordValidationResult result = new PasswordValidationResult();

        if (password == null || password.trim().isEmpty()) {
            result.addError("Password cannot be empty");
            return result;
        }

        if (password.length() < MIN_LENGTH) {
            result.addError("Password must be at least " + MIN_LENGTH + " characters long");
        }

        if (password.length() > MAX_LENGTH) {
            result.addError("Password cannot exceed " + MAX_LENGTH + " characters");
        }

        if (!HAS_UPPERCASE.matcher(password).find()) {
            result.addError("Password must contain at least one uppercase letter");
        }

        if (!HAS_LOWERCASE.matcher(password).find()) {
            result.addError("Password must contain at least one lowercase letter");
        }

        if (!HAS_NUMBER.matcher(password).find()) {
            result.addError("Password must contain at least one number");
        }

        if (!HAS_SPECIAL_CHAR.matcher(password).find()) {
            result.addError("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)");
        }

        if (!NO_COMMON_PASSWORDS.matcher(password).matches()) {
            result.addError("Password cannot be a common or easily guessable password");
        }

        if (hasSequentialCharacters(password)) {
            result.addError("Password cannot contain sequential characters (e.g., abc, 123)");
        }

        if (hasRepeatedCharacters(password)) {
            result.addError("Password cannot contain repeated characters (e.g., aaa, 111)");
        }

        return result;
    }

    private boolean hasSequentialCharacters(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            char c1 = password.charAt(i);
            char c2 = password.charAt(i + 1);
            char c3 = password.charAt(i + 2);

            if (Character.isLetter(c1) && Character.isLetter(c2) && Character.isLetter(c3)) {
                if (c2 == c1 + 1 && c3 == c2 + 1) {
                    return true;
                }
            } else if (Character.isDigit(c1) && Character.isDigit(c2) && Character.isDigit(c3)) {
                if (c2 == c1 + 1 && c3 == c2 + 1) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasRepeatedCharacters(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            char c1 = password.charAt(i);
            char c2 = password.charAt(i + 1);
            char c3 = password.charAt(i + 2);

            if (c1 == c2 && c2 == c3) {
                return true;
            }
        }
        return false;
    }

    public static class PasswordValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();

        public void addError(String error) {
            errors.add(error);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public java.util.List<String> getErrors() {
            return new java.util.ArrayList<>(errors);
        }

        public String getErrorMessage() {
            return String.join("; ", errors);
        }
    }
}