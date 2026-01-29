package com.agrorent.service;

import com.agrorent.dto.request.LoginRequest;
import com.agrorent.dto.request.RegisterRequest;
import com.agrorent.dto.response.AuthResponse;
import com.agrorent.dto.response.UserResponse;
import com.agrorent.model.User;
import com.agrorent.model.enums.UserRole;
import com.agrorent.repository.UserRepository;
import com.agrorent.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Build user entity - all users get USER role (can rent and borrow)
        User.UserBuilder userBuilder = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER) // Single role for all users
                .address(request.getAddress())
                .village(request.getVillage())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .preferredLanguage(request.getPreferredLanguage());

        // Set location if provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            userBuilder.location(new GeoJsonPoint(request.getLongitude(), request.getLatitude()));
        }

        User user = userRepository.save(userBuilder.build());

        // Generate token
        String token = jwtTokenProvider.generateToken(user.getPhone());

        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public UserResponse getCurrentUser(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.fromUser(user);
    }
}
