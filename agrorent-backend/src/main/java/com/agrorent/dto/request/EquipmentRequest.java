package com.agrorent.dto.request;

import com.agrorent.model.enums.EquipmentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    private String name;

    private String description;

    @NotNull(message = "Category is required")
    private EquipmentCategory category;

    // Images as base64 or URLs
    private List<String> images;

    // Verification documents
    private List<String> verificationDocs;

    // Pricing - at least one required
    @Positive(message = "Price per hour must be positive")
    private Double pricePerHour;

    @Positive(message = "Price per day must be positive")
    private Double pricePerDay;

    @Positive(message = "Price per week must be positive")
    private Double pricePerWeek;

    // Location
    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;
}
