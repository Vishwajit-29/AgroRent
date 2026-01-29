package com.agrorent.model.enums;

public enum UserRole {
    USER, // Standard user (can rent and borrow)
    ADMIN, // Admin user
    RENTER, // Deprecated: Mapped to USER in logic
    RENT_TAKER // Deprecated: Mapped to USER in logic
}
