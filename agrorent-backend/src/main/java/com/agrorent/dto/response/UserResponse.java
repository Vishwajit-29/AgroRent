package com.agrorent.dto.response;

import com.agrorent.model.User;
import com.agrorent.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private UserRole role;
    private Double latitude;
    private Double longitude;
    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;
    private String profileImage;
    private String preferredLanguage;
    private Double rating;
    private Integer totalRatings;
    private Boolean verified;

    public static UserResponse fromUser(User user) {
        UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .address(user.getAddress())
                .village(user.getVillage())
                .district(user.getDistrict())
                .state(user.getState())
                .pincode(user.getPincode())
                .profileImage(user.getProfileImage())
                .preferredLanguage(user.getPreferredLanguage())
                .rating(user.getRating())
                .totalRatings(user.getTotalRatings())
                .verified(user.getVerified());

        if (user.getLocation() != null) {
            builder.longitude(user.getLocation().getX());
            builder.latitude(user.getLocation().getY());
        }

        return builder.build();
    }
}
