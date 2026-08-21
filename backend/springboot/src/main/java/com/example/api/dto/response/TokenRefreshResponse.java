package com.example.api.dto.response;

public record TokenRefreshResponse(
        String token,
        String refreshToken,
        String type
) {
}
