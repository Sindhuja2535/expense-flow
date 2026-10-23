package com.expenseflow.repository;

import com.expenseflow.entity.Budget;
import com.expenseflow.entity.enums.BudgetPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    Optional<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);
    List<Budget> findByUserIdAndPeriod(Long userId, BudgetPeriod period);
}
