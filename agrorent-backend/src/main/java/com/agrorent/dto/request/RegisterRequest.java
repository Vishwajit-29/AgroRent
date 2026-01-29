package com.agrorent.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian mobile number")
    private String phone;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 50, message = "Password must be at least 4 characters")
    private String password;

    // Location
    private Double latitude;
    private Double longitude;
    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;

    @Builder.Default
    private String preferredLanguage = "hi";
}
