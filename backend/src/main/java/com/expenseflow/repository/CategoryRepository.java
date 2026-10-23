package com.expenseflow.repository;

import com.expenseflow.entity.Category;
import com.expenseflow.entity.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdAndType(Long userId, CategoryType type);
    Optional<Category> findByNameAndUserId(String name, Long userId);
    List<Category> findByUserIdIsNull();
    List<Category> findByUserIdIsNullAndType(CategoryType type);
}
