package com.agrorent.model;

import com.agrorent.model.enums.EquipmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipment")
public class Equipment {

    @Id
    private String id;

    // Owner reference
    @Indexed
    private String ownerId;
    private String ownerName;
    private String ownerPhone;

    // Equipment details
    private String name;
    private String description;

    @Indexed
    private EquipmentCategory category;

    // Images (URLs or base64)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    // Verification documents
    @Builder.Default
    private List<String> verificationDocs = new ArrayList<>();

    @Builder.Default
    private Boolean verified = false;

    // Pricing
    private Double pricePerHour;
    private Double pricePerDay;
    private Double pricePerWeek;

    // Location for geospatial queries
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;

    // Availability
    @Builder.Default
    private Boolean available = true;

    // Rating
    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalRatings = 0;

    // Total times rented
    @Builder.Default
    private Integer timesRented = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
