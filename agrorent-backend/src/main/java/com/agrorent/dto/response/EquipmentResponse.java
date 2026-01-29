package com.agrorent.dto.response;

import com.agrorent.model.Equipment;
import com.agrorent.model.enums.EquipmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private String id;
    private String ownerId;
    private String ownerName;
    private String ownerPhone;
    private String name;
    private String description;
    private EquipmentCategory category;
    private List<String> images;
    private List<String> verificationDocs;
    private Boolean verified;
    private Double pricePerHour;
    private Double pricePerDay;
    private Double pricePerWeek;
    private Double latitude;
    private Double longitude;
    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;
    private Boolean available;
    private Double rating;
    private Integer totalRatings;
    private Integer timesRented;
    private Double distanceKm;  // Distance from search location

    public static EquipmentResponse fromEquipment(Equipment equipment) {
        return fromEquipment(equipment, null);
    }

    public static EquipmentResponse fromEquipment(Equipment equipment, Double distanceKm) {
        EquipmentResponseBuilder builder = EquipmentResponse.builder()
                .id(equipment.getId())
                .ownerId(equipment.getOwnerId())
                .ownerName(equipment.getOwnerName())
                .ownerPhone(equipment.getOwnerPhone())
                .name(equipment.getName())
                .description(equipment.getDescription())
                .category(equipment.getCategory())
                .images(equipment.getImages())
                .verificationDocs(equipment.getVerificationDocs())
                .verified(equipment.getVerified())
                .pricePerHour(equipment.getPricePerHour())
                .pricePerDay(equipment.getPricePerDay())
                .pricePerWeek(equipment.getPricePerWeek())
                .address(equipment.getAddress())
                .village(equipment.getVillage())
                .district(equipment.getDistrict())
                .state(equipment.getState())
                .pincode(equipment.getPincode())
                .available(equipment.getAvailable())
                .rating(equipment.getRating())
                .totalRatings(equipment.getTotalRatings())
                .timesRented(equipment.getTimesRented())
                .distanceKm(distanceKm);

        if (equipment.getLocation() != null) {
            builder.longitude(equipment.getLocation().getX());
            builder.latitude(equipment.getLocation().getY());
        }

        return builder.build();
    }
}
