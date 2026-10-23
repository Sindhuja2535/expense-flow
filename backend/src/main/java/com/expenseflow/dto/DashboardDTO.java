package com.expenseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal savings;
    private BigDecimal remainingBudget;
    private List<ExpenseDTO> recentExpenses;
    private List<IncomeDTO> recentIncomes;
    private Map<String, BigDecimal> categoryWiseExpenses;
    private List<Map<String, Object>> monthlyData;
}
