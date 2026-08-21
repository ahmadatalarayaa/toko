package com.example.api.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.api.dto.request.LoginRequest;
import com.example.api.dto.request.RegisterRequest;
import com.example.api.dto.response.LoginResponse;
import com.example.api.dto.response.TokenRefreshResponse;
import com.example.api.dto.response.UserResponse;
import com.example.api.entity.RefreshToken;
import com.example.api.entity.Role;
import com.example.api.entity.User;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.repository.UserRepository;
import com.example.api.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        AuthenticationManager authenticationManager,
                        RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateToken(toUserDetails(savedUser));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        return new LoginResponse(accessToken, refreshToken.getToken(), "Bearer", toUserResponse(savedUser));
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        String accessToken = jwtService.generateToken(toUserDetails(user));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new LoginResponse(accessToken, refreshToken.getToken(), "Bearer", toUserResponse(user));
    }

    public TokenRefreshResponse refreshToken(String requestRefreshToken) {

        RefreshToken storedToken = refreshTokenService.findByToken(requestRefreshToken);
        RefreshToken validToken = refreshTokenService.verifyExpiration(storedToken);

        User user = validToken.getUser();

        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(validToken);
        String newAccessToken = jwtService.generateToken(toUserDetails(user));

        return new TokenRefreshResponse(newAccessToken, newRefreshToken.getToken(), "Bearer");
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        refreshTokenService.revokeAllUserTokens(user);
    }

    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
