package com.example.api.dto.response;

public record LoginResponse(
        String token,
        String refreshToken,
        String type,
        UserResponse user
) {
}
