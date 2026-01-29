package com.agrorent.repository;

import com.agrorent.model.Equipment;
import com.agrorent.model.enums.EquipmentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {

    // Find by owner
    List<Equipment> findByOwnerId(String ownerId);

    Page<Equipment> findByOwnerId(String ownerId, Pageable pageable);

    // Find available equipment
    List<Equipment> findByAvailableTrue();

    Page<Equipment> findByAvailableTrueAndCategory(EquipmentCategory category, Pageable pageable);

    // Find equipment near a location
    GeoResults<Equipment> findByLocationNear(Point location, Distance distance);

    List<Equipment> findByLocationNearAndAvailableTrue(Point location, Distance distance);

    // Find by category
    List<Equipment> findByCategory(EquipmentCategory category);

    // Custom query for advanced search
    @Query("{ 'available': true, 'pricePerDay': { $lte: ?0 } }")
    List<Equipment> findAvailableWithMaxPrice(Double maxPrice);

    // Count by owner
    long countByOwnerId(String ownerId);
}
