package com.expenseflow.service;

import com.expenseflow.dto.DashboardDTO;
import com.expenseflow.dto.ExpenseDTO;
import com.expenseflow.dto.IncomeDTO;
import com.expenseflow.entity.Category;
import com.expenseflow.entity.Expense;
import com.expenseflow.entity.Income;
import com.expenseflow.entity.User;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.CategoryRepository;
import com.expenseflow.repository.ExpenseRepository;
import com.expenseflow.repository.IncomeRepository;
import com.expenseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public ExpenseDTO create(ExpenseDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Expense expense = Expense.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .date(dto.getDate())
                .receiptUrl(dto.getReceiptUrl())
                .notes(dto.getNotes())
                .tags(dto.getTags())
                .isRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false)
                .recurringFrequency(dto.getRecurringFrequency() != null
                        ? com.expenseflow.entity.enums.Frequency.valueOf(dto.getRecurringFrequency())
                        : null)
                .user(user)
                .category(category)
                .build();

        expense = expenseRepository.save(expense);
        return mapToDTO(expense);
    }

    public List<ExpenseDTO> getByUser(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<ExpenseDTO> result = new ArrayList<>();
        for (Expense expense : expenses) {
            result.add(mapToDTO(expense));
        }
        return result;
    }

    public List<ExpenseDTO> getByUserAndDateRange(Long userId, LocalDate start, LocalDate end) {
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, start, end);
        List<ExpenseDTO> result = new ArrayList<>();
        for (Expense expense : expenses) {
            result.add(mapToDTO(expense));
        }
        return result;
    }

    public ExpenseDTO getById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return mapToDTO(expense);
    }

    public ExpenseDTO update(Long id, ExpenseDTO dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (dto.getAmount() != null) {
            expense.setAmount(dto.getAmount());
        }
        if (dto.getDescription() != null) {
            expense.setDescription(dto.getDescription());
        }
        if (dto.getDate() != null) {
            expense.setDate(dto.getDate());
        }
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            expense.setCategory(category);
        }
        if (dto.getReceiptUrl() != null) {
            expense.setReceiptUrl(dto.getReceiptUrl());
        }
        if (dto.getNotes() != null) {
            expense.setNotes(dto.getNotes());
        }
        if (dto.getTags() != null) {
            expense.setTags(dto.getTags());
        }
        if (dto.getIsRecurring() != null) {
            expense.setRecurring(dto.getIsRecurring());
        }
        if (dto.getRecurringFrequency() != null) {
            expense.setRecurringFrequency(
                    com.expenseflow.entity.enums.Frequency.valueOf(dto.getRecurringFrequency()));
        }

        expense = expenseRepository.save(expense);
        return mapToDTO(expense);
    }

    public void delete(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    public String exportCsv(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Date,Description,Category,Amount,Notes,Tags,Recurring").append("\r\n");
        for (Expense e : expenses) {
            csv.append(e.getId()).append(',');
            csv.append(e.getDate() != null ? e.getDate().toString() : "").append(',');
            csv.append(csvEscape(e.getDescription())).append(',');
            csv.append(csvEscape(e.getCategory() != null ? e.getCategory().getName() : "")).append(',');
            csv.append(e.getAmount() != null ? e.getAmount().toPlainString() : "0").append(',');
            csv.append(csvEscape(e.getNotes())).append(',');
            csv.append(csvEscape(e.getTags())).append(',');
            csv.append(e.isRecurring() ? "Yes" : "No").append("\r\n");
        }
        return csv.toString();
    }

    private String csvEscape(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        String v = value;
        if (v.matches("^[=+@\\-].*")) {
            v = "'" + v;
        }
        if (v.contains(",") || v.contains("\"") || v.contains("\n") || v.contains("\r")) {
            v = "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }

    public DashboardDTO getDashboard(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        BigDecimal monthlyIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        BigDecimal monthlyExpense = expenseRepository.sumAmountByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;
        if (monthlyExpense == null) monthlyExpense = BigDecimal.ZERO;

        BigDecimal savings = monthlyIncome.subtract(monthlyExpense);

        BigDecimal totalIncome = incomeRepository.sumAmountByUserId(userId);
        BigDecimal totalExpense = expenseRepository.sumAmountByUserId(userId);

        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal totalBalance = totalIncome.subtract(totalExpense);

        List<Expense> recentExpenses = expenseRepository.findTop10ByUserIdOrderByDateDesc(userId);
        List<ExpenseDTO> recentExpenseDTOs = new ArrayList<>();
        for (Expense e : recentExpenses) {
            recentExpenseDTOs.add(mapToDTO(e));
        }

        List<Income> recentIncomes = incomeRepository.findTop10ByUserIdOrderByDateDesc(userId);
        List<IncomeDTO> recentIncomeDTOs = new ArrayList<>();
        for (Income i : recentIncomes) {
            recentIncomeDTOs.add(toIncomeDTO(i));
        }

        Map<String, BigDecimal> categoryWiseExpenses = new LinkedHashMap<>();
        List<Object[]> categoryData = expenseRepository.sumAmountByCategoryName(userId);
        for (Object[] row : categoryData) {
            String categoryName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            categoryWiseExpenses.put(categoryName, amount);
        }

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate mStart = month.atDay(1);
            LocalDate mEnd = month.atEndOfMonth();

            BigDecimal mIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, mStart, mEnd);
            BigDecimal mExpense = expenseRepository.sumAmountByUserIdAndDateBetween(userId, mStart, mEnd);

            if (mIncome == null) mIncome = BigDecimal.ZERO;
            if (mExpense == null) mExpense = BigDecimal.ZERO;

            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("month", month.getMonth().name());
            monthData.put("year", month.getYear());
            monthData.put("income", mIncome);
            monthData.put("expense", mExpense);
            monthlyData.add(monthData);
        }

        return DashboardDTO.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .savings(savings)
                .recentExpenses(recentExpenseDTOs)
                .recentIncomes(recentIncomeDTOs)
                .categoryWiseExpenses(categoryWiseExpenses)
                .monthlyData(monthlyData)
                .build();
    }

    private ExpenseDTO mapToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getDate())
                .categoryName(expense.getCategory() != null ? expense.getCategory().getName() : null)
                .categoryId(expense.getCategory() != null ? expense.getCategory().getId() : null)
                .receiptUrl(expense.getReceiptUrl())
                .notes(expense.getNotes())
                .tags(expense.getTags())
                .isRecurring(expense.isRecurring())
                .recurringFrequency(expense.getRecurringFrequency() != null
                        ? expense.getRecurringFrequency().name() : null)
                .build();
    }

    private IncomeDTO toIncomeDTO(Income income) {
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
