package com.agrorent.dto.response;

import com.agrorent.model.Booking;
import com.agrorent.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String equipmentId;
    private String equipmentName;
    private String equipmentCategory;
    private String renterId;
    private String renterName;
    private String renterPhone;
    private String rentTakerId;
    private String rentTakerName;
    private String rentTakerPhone;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer durationHours;
    private Double totalCost;
    private String pricingType;
    private BookingStatus status;
    private String notes;
    private String rejectionReason;
    private Integer ratingByRentTaker;
    private String reviewByRentTaker;
    private Integer ratingByRenter;
    private String reviewByRenter;
    private LocalDateTime createdAt;

    public static BookingResponse fromBooking(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .equipmentId(booking.getEquipmentId())
                .equipmentName(booking.getEquipmentName())
                .equipmentCategory(booking.getEquipmentCategory())
                .renterId(booking.getRenterId())
                .renterName(booking.getRenterName())
                .renterPhone(booking.getRenterPhone())
                .rentTakerId(booking.getRentTakerId())
                .rentTakerName(booking.getRentTakerName())
                .rentTakerPhone(booking.getRentTakerPhone())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .durationHours(booking.getDurationHours())
                .totalCost(booking.getTotalCost())
                .pricingType(booking.getPricingType())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .rejectionReason(booking.getRejectionReason())
                .ratingByRentTaker(booking.getRatingByRentTaker())
                .reviewByRentTaker(booking.getReviewByRentTaker())
                .ratingByRenter(booking.getRatingByRenter())
                .reviewByRenter(booking.getReviewByRenter())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
