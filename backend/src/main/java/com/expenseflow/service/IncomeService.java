package com.expenseflow.service;

import com.expenseflow.dto.IncomeDTO;
import com.expenseflow.entity.Category;
import com.expenseflow.entity.Income;
import com.expenseflow.entity.User;
import com.expenseflow.entity.enums.IncomeSource;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.CategoryRepository;
import com.expenseflow.repository.IncomeRepository;
import com.expenseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public IncomeDTO create(IncomeDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Income income = Income.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .date(dto.getDate())
                .source(IncomeSource.valueOf(dto.getSource()))
                .isRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false)
                .recurringFrequency(dto.getRecurringFrequency() != null
                        ? com.expenseflow.entity.enums.Frequency.valueOf(dto.getRecurringFrequency())
                        : null)
                .user(user)
                .category(category)
                .build();

        income = incomeRepository.save(income);
        return mapToDTO(income);
    }

    public List<IncomeDTO> getByUser(Long userId) {
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<IncomeDTO> result = new ArrayList<>();
        for (Income income : incomes) {
            result.add(mapToDTO(income));
        }
        return result;
    }

    public List<IncomeDTO> getByUserAndDateRange(Long userId, LocalDate start, LocalDate end) {
        List<Income> incomes = incomeRepository.findByUserIdAndDateBetween(userId, start, end);
        List<IncomeDTO> result = new ArrayList<>();
        for (Income income : incomes) {
            result.add(mapToDTO(income));
        }
        return result;
    }

    public IncomeDTO getById(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        return mapToDTO(income);
    }

    public IncomeDTO update(Long id, IncomeDTO dto) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));

        if (dto.getAmount() != null) {
            income.setAmount(dto.getAmount());
        }
        if (dto.getDescription() != null) {
            income.setDescription(dto.getDescription());
        }
        if (dto.getDate() != null) {
            income.setDate(dto.getDate());
        }
        if (dto.getSource() != null) {
            income.setSource(IncomeSource.valueOf(dto.getSource()));
        }
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            income.setCategory(category);
        }
        if (dto.getIsRecurring() != null) {
            income.setRecurring(dto.getIsRecurring());
        }
        if (dto.getRecurringFrequency() != null) {
            income.setRecurringFrequency(
                    com.expenseflow.entity.enums.Frequency.valueOf(dto.getRecurringFrequency()));
        }

        income = incomeRepository.save(income);
        return mapToDTO(income);
    }

    public void delete(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        incomeRepository.delete(income);
    }

    private IncomeDTO mapToDTO(Income income) {
        return IncomeDTO.builder()
                .id(income.getId())
                .amount(income.getAmount())
                .description(income.getDescription())
                .date(income.getDate())
                .source(income.getSource() != null ? income.getSource().name() : null)
                .categoryName(income.getCategory() != null ? income.getCategory().getName() : null)
                .categoryId(income.getCategory() != null ? income.getCategory().getId() : null)
                .isRecurring(income.isRecurring())
                .recurringFrequency(income.getRecurringFrequency() != null
                        ? income.getRecurringFrequency().name() : null)
                .build();
    }
}
