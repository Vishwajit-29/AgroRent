package com.agrorent.controller;

import com.agrorent.dto.request.EquipmentRequest;
import com.agrorent.dto.request.EquipmentSearchRequest;
import com.agrorent.dto.response.ApiResponse;
import com.agrorent.dto.response.EquipmentResponse;
import com.agrorent.model.enums.EquipmentCategory;
import com.agrorent.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    // ===== PUBLIC ENDPOINTS =====

    @GetMapping("/public/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentById(@PathVariable String id) {
        try {
            EquipmentResponse response = equipmentService.getEquipmentById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/public/category/{category}")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getByCategory(
            @PathVariable EquipmentCategory category) {
        try {
            List<EquipmentResponse> response = equipmentService.getEquipmentByCategory(category);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> searchEquipment(
            @RequestBody EquipmentSearchRequest request) {
        try {
            List<EquipmentResponse> response = equipmentService.searchEquipment(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search/nearby")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getNearbyEquipment(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "50") Double radiusKm) {
        try {
            List<EquipmentResponse> response = equipmentService.getNearbyEquipment(latitude, longitude, radiusKm);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== RENTER ENDPOINTS =====

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getMyEquipment(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<EquipmentResponse> response = equipmentService.getMyEquipment(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody EquipmentRequest request) {
        try {
            EquipmentResponse response = equipmentService.createEquipment(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Equipment added successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/my/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody EquipmentRequest request) {
        try {
            EquipmentResponse response = equipmentService.updateEquipment(userDetails.getUsername(), id, request);
            return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/my/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            equipmentService.deleteEquipment(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/my/{id}/toggle-availability")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> toggleAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        try {
            EquipmentResponse response = equipmentService.toggleAvailability(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.success(
                    response.getAvailable() ? "Equipment is now available" : "Equipment is now unavailable",
                    response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/categories")
class CategoryController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentCategory>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(Arrays.asList(EquipmentCategory.values())));
    }
}
