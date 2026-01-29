package com.agrorent.model;

import com.agrorent.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    // Equipment reference
    @Indexed
    private String equipmentId;
    private String equipmentName;
    private String equipmentCategory;

    // Owner (Renter) reference
    @Indexed
    private String renterId;
    private String renterName;
    private String renterPhone;

    // Seeker (Rent Taker) reference
    @Indexed
    private String rentTakerId;
    private String rentTakerName;
    private String rentTakerPhone;

    // Booking details
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Duration in hours
    private Integer durationHours;

    // Cost calculation
    private Double totalCost;
    private String pricingType; // HOURLY, DAILY, WEEKLY

    // Status tracking
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // Additional notes
    private String notes;
    private String rejectionReason;

    // Rating given after completion
    private Integer ratingByRentTaker;     // Rating given to equipment/owner
    private String reviewByRentTaker;
    private Integer ratingByRenter;        // Rating given to rent taker
    private String reviewByRenter;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
