package com.agrorent.service;

import com.agrorent.dto.request.BookingRequest;
import com.agrorent.dto.request.RatingRequest;
import com.agrorent.dto.response.BookingResponse;
import com.agrorent.model.Booking;
import com.agrorent.model.Equipment;
import com.agrorent.model.User;
import com.agrorent.model.enums.BookingStatus;
import com.agrorent.repository.BookingRepository;
import com.agrorent.repository.EquipmentRepository;
import com.agrorent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public BookingResponse createBooking(String rentTakerPhone, BookingRequest request) {
        User rentTaker = userRepository.findByPhone(rentTakerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (!equipment.getAvailable()) {
            throw new RuntimeException("Equipment is not available for booking");
        }

        // Check for conflicting bookings
        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.ACTIVE
        );
        List<Booking> conflicts = bookingRepository
                .findByEquipmentIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        equipment.getId(), activeStatuses, request.getEndDate(), request.getStartDate()
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Equipment is already booked for the selected dates");
        }

        // Calculate duration and cost
        long hours = Duration.between(request.getStartDate(), request.getEndDate()).toHours();
        long days = hours / 24;
        String pricingType;
        double totalCost;

        if (days >= 7 && equipment.getPricePerWeek() != null) {
            pricingType = "WEEKLY";
            totalCost = (days / 7.0) * equipment.getPricePerWeek();
        } else if (days >= 1 && equipment.getPricePerDay() != null) {
            pricingType = "DAILY";
            totalCost = days * equipment.getPricePerDay();
        } else if (equipment.getPricePerHour() != null) {
            pricingType = "HOURLY";
            totalCost = hours * equipment.getPricePerHour();
        } else {
            pricingType = "DAILY";
            totalCost = Math.max(1, days) * (equipment.getPricePerDay() != null ? equipment.getPricePerDay() : 0);
        }

        Booking booking = Booking.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .equipmentCategory(equipment.getCategory().name())
                .renterId(equipment.getOwnerId())
                .renterName(equipment.getOwnerName())
                .renterPhone(equipment.getOwnerPhone())
                .rentTakerId(rentTaker.getId())
                .rentTakerName(rentTaker.getName())
                .rentTakerPhone(rentTaker.getPhone())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .durationHours((int) hours)
                .totalCost(Math.round(totalCost * 100.0) / 100.0)
                .pricingType(pricingType)
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse approveBooking(String renterPhone, String bookingId) {
        Booking booking = getBookingForRenter(renterPhone, bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse rejectBooking(String renterPhone, String bookingId, String reason) {
        Booking booking = getBookingForRenter(renterPhone, bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse startBooking(String renterPhone, String bookingId) {
        Booking booking = getBookingForRenter(renterPhone, bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only approved bookings can be started");
        }

        booking.setStatus(BookingStatus.ACTIVE);
        booking = bookingRepository.save(booking);

        // Update equipment times rented
        Equipment equipment = equipmentRepository.findById(booking.getEquipmentId()).orElse(null);
        if (equipment != null) {
            equipment.setTimesRented(equipment.getTimesRented() + 1);
            equipmentRepository.save(equipment);
        }

        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse completeBooking(String renterPhone, String bookingId) {
        Booking booking = getBookingForRenter(renterPhone, bookingId);

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Only active bookings can be completed");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse cancelBooking(String userPhone, String bookingId) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Either renter or rent taker can cancel
        if (!booking.getRenterId().equals(user.getId()) && !booking.getRentTakerId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Completed bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse rateByRentTaker(String rentTakerPhone, RatingRequest request) {
        User rentTaker = userRepository.findByPhone(rentTakerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRentTakerId().equals(rentTaker.getId())) {
            throw new RuntimeException("You can only rate your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Can only rate completed bookings");
        }

        booking.setRatingByRentTaker(request.getRating());
        booking.setReviewByRentTaker(request.getReview());
        booking = bookingRepository.save(booking);

        // Update equipment rating
        updateEquipmentRating(booking.getEquipmentId());

        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse rateByRenter(String renterPhone, RatingRequest request) {
        Booking booking = getBookingForRenter(renterPhone, request.getBookingId());

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Can only rate completed bookings");
        }

        booking.setRatingByRenter(request.getRating());
        booking.setReviewByRenter(request.getReview());
        booking = bookingRepository.save(booking);

        // Update rent taker's rating
        updateUserRating(booking.getRentTakerId());

        return BookingResponse.fromBooking(booking);
    }

    public List<BookingResponse> getRenterBookings(String renterPhone) {
        User renter = userRepository.findByPhone(renterPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByRenterId(renter.getId())
                .stream()
                .map(BookingResponse::fromBooking)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getRentTakerBookings(String rentTakerPhone) {
        User rentTaker = userRepository.findByPhone(rentTakerPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByRentTakerId(rentTaker.getId())
                .stream()
                .map(BookingResponse::fromBooking)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getPendingBookingsForRenter(String renterPhone) {
        User renter = userRepository.findByPhone(renterPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByRenterIdAndStatusOrderByCreatedAtDesc(renter.getId(), BookingStatus.PENDING)
                .stream()
                .map(BookingResponse::fromBooking)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return BookingResponse.fromBooking(booking);
    }

    private Booking getBookingForRenter(String renterPhone, String bookingId) {
        User renter = userRepository.findByPhone(renterPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenterId().equals(renter.getId())) {
            throw new RuntimeException("This booking does not belong to you");
        }

        return booking;
    }

    private void updateEquipmentRating(String equipmentId) {
        List<Booking> completedBookings = bookingRepository.findByEquipmentId(equipmentId)
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getRatingByRentTaker() != null)
                .collect(Collectors.toList());

        if (!completedBookings.isEmpty()) {
            double avgRating = completedBookings.stream()
                    .mapToInt(Booking::getRatingByRentTaker)
                    .average()
                    .orElse(0.0);

            Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
            if (equipment != null) {
                equipment.setRating(Math.round(avgRating * 10.0) / 10.0);
                equipment.setTotalRatings(completedBookings.size());
                equipmentRepository.save(equipment);
            }
        }
    }

    private void updateUserRating(String userId) {
        List<Booking> completedBookings = bookingRepository.findByRentTakerId(userId)
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getRatingByRenter() != null)
                .collect(Collectors.toList());

        if (!completedBookings.isEmpty()) {
            double avgRating = completedBookings.stream()
                    .mapToInt(Booking::getRatingByRenter)
                    .average()
                    .orElse(0.0);

            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                user.setRating(Math.round(avgRating * 10.0) / 10.0);
                user.setTotalRatings(completedBookings.size());
                userRepository.save(user);
            }
        }
    }
}
