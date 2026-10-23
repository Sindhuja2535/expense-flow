package com.expenseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private BigDecimal amount;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private String categoryName;
    private Long categoryId;
}
