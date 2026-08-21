package com.example.api.service;

import java.math.BigDecimal;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.api.dto.request.ProductRequest;
import com.example.api.dto.response.PageResponse;
import com.example.api.dto.response.ProductResponse;
import com.example.api.entity.Product;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.repository.ProductRepository;
import com.example.api.specification.ProductSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "name", "price", "stock", "createdAt", "updatedAt"
    );

    public PageResponse<ProductResponse> search(
            String keyword,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "sortBy tidak valid. Gunakan salah satu dari: " + ALLOWED_SORT_FIELDS
            );
        }

        if (page < 0) {
            throw new IllegalArgumentException("page tidak boleh kurang dari 0");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size harus di antara 1 dan 100");
        }

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = Specification
                .allOf(ProductSpecification.hasNameLike(keyword))
                .and(ProductSpecification.hasPriceGreaterThanOrEqual(minPrice))
                .and(ProductSpecification.hasPriceLessThanOrEqual(maxPrice));

        Page<ProductResponse> resultPage = productRepository.findAll(spec, pageable)
                .map(this::toResponse);

        return PageResponse.from(resultPage);
    }

    // GET BY ID
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan ID " + id + " tidak ditemukan"
                ));

        return toResponse(product);
    }

    // CREATE
    public ProductResponse create(ProductRequest request) {

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    // UPDATE
    public ProductResponse update(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan ID " + id + " tidak ditemukan"
                ));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        Product updatedProduct = productRepository.save(product);

        return toResponse(updatedProduct);
    }

    // DELETE
    public void delete(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan ID " + id + " tidak ditemukan"
                ));

        productRepository.delete(product);
    }

    // ENTITY
    private ProductResponse toResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
