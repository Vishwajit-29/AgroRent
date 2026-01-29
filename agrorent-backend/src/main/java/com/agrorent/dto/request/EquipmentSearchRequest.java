package com.agrorent.dto.request;

import com.agrorent.model.enums.EquipmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentSearchRequest {

    // Location-based search
    private Double latitude;
    private Double longitude;
    private Double radiusKm;  // Search radius in kilometers

    // Filters
    private EquipmentCategory category;
    private Double minPrice;
    private Double maxPrice;
    private String pricingType;  // HOURLY, DAILY, WEEKLY

    // Sorting
    private String sortBy;  // distance, price, rating
    private String sortOrder;  // asc, desc

    // Pagination
    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 20;
}
