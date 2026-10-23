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
public class IncomeDTO {
    private Long id;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private String source;
    private String categoryName;
    private Long categoryId;
    private Boolean isRecurring;
    private String recurringFrequency;
}
