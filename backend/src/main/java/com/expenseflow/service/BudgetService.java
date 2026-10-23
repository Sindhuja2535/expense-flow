package com.expenseflow.service;

import com.expenseflow.dto.BudgetDTO;
import com.expenseflow.entity.Budget;
import com.expenseflow.entity.Category;
import com.expenseflow.entity.User;
import com.expenseflow.entity.enums.BudgetPeriod;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.BudgetRepository;
import com.expenseflow.repository.CategoryRepository;
import com.expenseflow.repository.ExpenseRepository;
import com.expenseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public BudgetDTO create(BudgetDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Budget budget = Budget.builder()
                .amount(dto.getAmount())
                .period(BudgetPeriod.valueOf(dto.getPeriod()))
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .user(user)
                .category(category)
                .build();

        budget = budgetRepository.save(budget);
        return mapToDTO(budget);
    }

    public List<BudgetDTO> getByUser(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<BudgetDTO> result = new ArrayList<>();
        for (Budget budget : budgets) {
            result.add(mapToDTO(budget));
        }
        return result;
    }

    public BudgetDTO getById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        return mapToDTO(budget);
    }

    public BudgetDTO update(Long id, BudgetDTO dto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (dto.getAmount() != null) {
            budget.setAmount(dto.getAmount());
        }
        if (dto.getPeriod() != null) {
            budget.setPeriod(BudgetPeriod.valueOf(dto.getPeriod()));
        }
        if (dto.getStartDate() != null) {
            budget.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            budget.setEndDate(dto.getEndDate());
        }
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            budget.setCategory(category);
        }

        budget = budgetRepository.save(budget);
        return mapToDTO(budget);
    }

    public void delete(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    public List<Map<String, Object>> getBudgetProgress(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Map<String, Object>> progressList = new ArrayList<>();

        for (Budget budget : budgets) {
            LocalDate start = budget.getStartDate() != null ? budget.getStartDate() : LocalDate.now().withDayOfMonth(1);
            LocalDate end = budget.getEndDate() != null ? budget.getEndDate() : LocalDate.now();

            BigDecimal spent;
            if (budget.getCategory() != null) {
                spent = expenseRepository.findByUserIdAndCategoryId(userId, budget.getCategory().getId())
                        .stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(start) && !e.getDate().isAfter(end))
                        .map(e -> e.getAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            } else {
                spent = expenseRepository.sumAmountByUserIdAndDateBetween(userId, start, end);
                if (spent == null) spent = BigDecimal.ZERO;
            }

            BigDecimal percentage = BigDecimal.ZERO;
            if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.multiply(BigDecimal.valueOf(100))
                        .divide(budget.getAmount(), 1, RoundingMode.HALF_UP);
            }

            Map<String, Object> progress = new HashMap<>();
            progress.put("id", budget.getId());
            progress.put("amount", budget.getAmount());
            progress.put("period", budget.getPeriod().name());
            progress.put("startDate", budget.getStartDate());
            progress.put("endDate", budget.getEndDate());
            progress.put("categoryName", budget.getCategory() != null ? budget.getCategory().getName() : "All Categories");
            progress.put("categoryId", budget.getCategory() != null ? budget.getCategory().getId() : null);
            progress.put("spent", spent);
            progress.put("percentage", percentage);
            progressList.add(progress);
        }

        return progressList;
    }

    private BudgetDTO mapToDTO(Budget budget) {
        return BudgetDTO.builder()
                .id(budget.getId())
                .amount(budget.getAmount())
                .period(budget.getPeriod().name())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : null)
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .build();
    }
}
