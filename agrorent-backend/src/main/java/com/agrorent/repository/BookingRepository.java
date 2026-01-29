package com.agrorent.repository;

import com.agrorent.model.Booking;
import com.agrorent.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Find by renter (equipment owner)
    List<Booking> findByRenterId(String renterId);

    Page<Booking> findByRenterId(String renterId, Pageable pageable);

    // Find by rent taker
    List<Booking> findByRentTakerId(String rentTakerId);

    Page<Booking> findByRentTakerId(String rentTakerId, Pageable pageable);

    // Find by equipment
    List<Booking> findByEquipmentId(String equipmentId);

    // Find by status
    List<Booking> findByRenterIdAndStatus(String renterId, BookingStatus status);

    List<Booking> findByRentTakerIdAndStatus(String rentTakerId, BookingStatus status);

    // Find pending bookings for a renter
    List<Booking> findByRenterIdAndStatusOrderByCreatedAtDesc(String renterId, BookingStatus status);

    // Check for conflicting bookings
    List<Booking> findByEquipmentIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            String equipmentId,
            List<BookingStatus> statuses,
            LocalDateTime endDate,
            LocalDateTime startDate
    );

    // Count bookings
    long countByRenterId(String renterId);

    long countByRentTakerId(String rentTakerId);

    long countByRenterIdAndStatus(String renterId, BookingStatus status);
}
