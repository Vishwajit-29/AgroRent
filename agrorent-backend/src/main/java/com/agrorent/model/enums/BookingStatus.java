package com.agrorent.model.enums;

public enum BookingStatus {
    PENDING,    // Request submitted, awaiting owner approval
    APPROVED,   // Owner approved the request
    REJECTED,   // Owner rejected the request
    ACTIVE,     // Rental is currently ongoing
    COMPLETED,  // Rental completed successfully
    CANCELLED   // Booking was cancelled
}
