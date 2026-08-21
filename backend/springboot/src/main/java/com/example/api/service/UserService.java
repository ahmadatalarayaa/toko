package com.example.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.api.dto.request.UserRequest;
import com.example.api.dto.response.UserResponse;
import com.example.api.entity.User;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // GET ALL (admin)
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET BY ID (admin)
    public UserResponse getById(Long id) {
        User user = findUserById(id);
        return toResponse(user);
    }

    // GET PROFIL SENDIRI
    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User dengan email " + email + " tidak ditemukan"
                ));
        return toResponse(user);
    }

    // UPDATE
    public UserResponse update(Long id, UserRequest request) {
        User user = findUserById(id);

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email sudah digunakan oleh user lain");
        }

        user.setName(request.name());
        user.setEmail(request.email());

        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    // DELETE (admin)
    public void delete(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User dengan ID " + id + " tidak ditemukan"
                ));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
