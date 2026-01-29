package com.agrorent.service;

import com.agrorent.dto.request.EquipmentRequest;
import com.agrorent.dto.request.EquipmentSearchRequest;
import com.agrorent.dto.response.EquipmentResponse;
import com.agrorent.model.Equipment;
import com.agrorent.model.User;
import com.agrorent.model.enums.EquipmentCategory;
import com.agrorent.repository.EquipmentRepository;
import com.agrorent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public EquipmentResponse createEquipment(String ownerPhone, EquipmentRequest request) {
        User owner = userRepository.findByPhone(ownerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Equipment equipment = Equipment.builder()
                .ownerId(owner.getId())
                .ownerName(owner.getName())
                .ownerPhone(owner.getPhone())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .images(request.getImages() != null ? request.getImages() : new ArrayList<>())
                .verificationDocs(request.getVerificationDocs() != null ? request.getVerificationDocs() : new ArrayList<>())
                .pricePerHour(request.getPricePerHour())
                .pricePerDay(request.getPricePerDay())
                .pricePerWeek(request.getPricePerWeek())
                .location(new GeoJsonPoint(request.getLongitude(), request.getLatitude()))
                .address(request.getAddress())
                .village(request.getVillage())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .build();

        equipment = equipmentRepository.save(equipment);
        return EquipmentResponse.fromEquipment(equipment);
    }

    public EquipmentResponse updateEquipment(String ownerPhone, String equipmentId, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        User owner = userRepository.findByPhone(ownerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!equipment.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You can only update your own equipment");
        }

        equipment.setName(request.getName());
        equipment.setDescription(request.getDescription());
        equipment.setCategory(request.getCategory());
        if (request.getImages() != null) equipment.setImages(request.getImages());
        if (request.getVerificationDocs() != null) equipment.setVerificationDocs(request.getVerificationDocs());
        equipment.setPricePerHour(request.getPricePerHour());
        equipment.setPricePerDay(request.getPricePerDay());
        equipment.setPricePerWeek(request.getPricePerWeek());
        equipment.setLocation(new GeoJsonPoint(request.getLongitude(), request.getLatitude()));
        equipment.setAddress(request.getAddress());
        equipment.setVillage(request.getVillage());
        equipment.setDistrict(request.getDistrict());
        equipment.setState(request.getState());
        equipment.setPincode(request.getPincode());

        equipment = equipmentRepository.save(equipment);
        return EquipmentResponse.fromEquipment(equipment);
    }

    public void deleteEquipment(String ownerPhone, String equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        User owner = userRepository.findByPhone(ownerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!equipment.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You can only delete your own equipment");
        }

        equipmentRepository.delete(equipment);
    }

    public EquipmentResponse toggleAvailability(String ownerPhone, String equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        User owner = userRepository.findByPhone(ownerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!equipment.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You can only update your own equipment");
        }

        equipment.setAvailable(!equipment.getAvailable());
        equipment = equipmentRepository.save(equipment);
        return EquipmentResponse.fromEquipment(equipment);
    }

    public List<EquipmentResponse> getMyEquipment(String ownerPhone) {
        User owner = userRepository.findByPhone(ownerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return equipmentRepository.findByOwnerId(owner.getId())
                .stream()
                .map(EquipmentResponse::fromEquipment)
                .collect(Collectors.toList());
    }

    public EquipmentResponse getEquipmentById(String equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return EquipmentResponse.fromEquipment(equipment);
    }

    public List<EquipmentResponse> searchEquipment(EquipmentSearchRequest request) {
        // Build query
        Query query = new Query();
        query.addCriteria(Criteria.where("available").is(true));

        // Category filter
        if (request.getCategory() != null) {
            query.addCriteria(Criteria.where("category").is(request.getCategory()));
        }

        // Price filter
        if (request.getMaxPrice() != null) {
            String priceField = "pricePerDay";
            if ("HOURLY".equals(request.getPricingType())) {
                priceField = "pricePerHour";
            } else if ("WEEKLY".equals(request.getPricingType())) {
                priceField = "pricePerWeek";
            }

            Criteria priceCriteria = Criteria.where(priceField);
            if (request.getMinPrice() != null) {
                priceCriteria = priceCriteria.gte(request.getMinPrice());
            }
            priceCriteria = priceCriteria.lte(request.getMaxPrice());
            query.addCriteria(priceCriteria);
        }

        List<Equipment> results;

        // Location-based search
        if (request.getLatitude() != null && request.getLongitude() != null) {
            Point searchPoint = new Point(request.getLongitude(), request.getLatitude());
            double radiusKm = request.getRadiusKm() != null ? request.getRadiusKm() : 50.0;

            query.addCriteria(
                    Criteria.where("location").nearSphere(searchPoint)
                            .maxDistance(radiusKm / 6378.1) // Convert km to radians
            );

            results = mongoTemplate.find(query, Equipment.class);

            // Calculate distances and convert to response
            return results.stream()
                    .map(eq -> {
                        double distance = calculateDistance(
                                request.getLatitude(), request.getLongitude(),
                                eq.getLocation().getY(), eq.getLocation().getX()
                        );
                        return EquipmentResponse.fromEquipment(eq, distance);
                    })
                    .sorted(getSorter(request))
                    .collect(Collectors.toList());
        } else {
            // Non-location based search
            results = mongoTemplate.find(query, Equipment.class);
            return results.stream()
                    .map(EquipmentResponse::fromEquipment)
                    .sorted(getSorter(request))
                    .collect(Collectors.toList());
        }
    }

    public List<EquipmentResponse> getNearbyEquipment(double latitude, double longitude, double radiusKm) {
        Point location = new Point(longitude, latitude);
        Distance distance = new Distance(radiusKm, Metrics.KILOMETERS);

        GeoResults<Equipment> results = equipmentRepository.findByLocationNear(location, distance);

        return results.getContent().stream()
                .filter(result -> result.getContent().getAvailable())
                .map(result -> {
                    double distanceKm = result.getDistance().getValue();
                    return EquipmentResponse.fromEquipment(result.getContent(), distanceKm);
                })
                .collect(Collectors.toList());
    }

    public List<EquipmentResponse> getEquipmentByCategory(EquipmentCategory category) {
        return equipmentRepository.findByCategory(category)
                .stream()
                .filter(Equipment::getAvailable)
                .map(EquipmentResponse::fromEquipment)
                .collect(Collectors.toList());
    }

    private Comparator<EquipmentResponse> getSorter(EquipmentSearchRequest request) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "distance";
        boolean asc = !"desc".equalsIgnoreCase(request.getSortOrder());

        Comparator<EquipmentResponse> comparator;

        switch (sortBy.toLowerCase()) {
            case "price":
                comparator = Comparator.comparing(
                        eq -> eq.getPricePerDay() != null ? eq.getPricePerDay() : Double.MAX_VALUE
                );
                break;
            case "rating":
                comparator = Comparator.comparing(
                        eq -> eq.getRating() != null ? eq.getRating() : 0.0
                );
                if (asc) comparator = comparator.reversed(); // Higher rating first by default
                break;
            case "distance":
            default:
                comparator = Comparator.comparing(
                        eq -> eq.getDistanceKm() != null ? eq.getDistanceKm() : Double.MAX_VALUE
                );
                break;
        }

        return asc ? comparator : comparator.reversed();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0; // Round to 1 decimal place
    }
}
