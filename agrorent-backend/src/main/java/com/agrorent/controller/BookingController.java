package com.agrorent.controller;

import com.agrorent.dto.request.BookingRequest;
import com.agrorent.dto.request.RatingRequest;
import com.agrorent.dto.response.ApiResponse;
import com.agrorent.dto.response.BookingResponse;
import com.agrorent.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ===== RENT TAKER ENDPOINTS =====

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse response = bookingService.createBooking(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Booking request submitted", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BookingResponse> response = bookingService.getRentTakerBookings(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/my/{id}/rate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> rateAsRentTaker(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody RatingRequest request) {
        try {
            request.setBookingId(id);
            BookingResponse response = bookingService.rateByRentTaker(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Rating submitted", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== RENTER ENDPOINTS =====

    @GetMapping("/renter")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getRenterBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BookingResponse> response = bookingService.getRenterBookings(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/renter/pending")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getPendingBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BookingResponse> response = bookingService.getPendingBookingsForRenter(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/renter/{id}/approve")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            BookingResponse response = bookingService.approveBooking(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success("Booking approved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/renter/{id}/reject")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        try {
            BookingResponse response = bookingService.rejectBooking(userDetails.getUsername(), id, reason);
            return ResponseEntity.ok(ApiResponse.success("Booking rejected", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/renter/{id}/start")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> startBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            BookingResponse response = bookingService.startBooking(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success("Rental started", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/renter/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> completeBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            BookingResponse response = bookingService.completeBooking(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success("Rental completed", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/renter/{id}/rate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> rateAsRenter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody RatingRequest request) {
        try {
            request.setBookingId(id);
            BookingResponse response = bookingService.rateByRenter(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Rating submitted", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== COMMON ENDPOINTS =====

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable String id) {
        try {
            BookingResponse response = bookingService.getBookingById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            BookingResponse response = bookingService.cancelBooking(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
