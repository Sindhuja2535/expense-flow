package com.expenseflow.controller;

import com.expenseflow.dto.ExpenseDTO;
import com.expenseflow.security.UserPrincipal;
import com.expenseflow.service.ExpenseService;
import com.expenseflow.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody ExpenseDTO expenseDTO) {
        Long userId = getCurrentUserId();
        ExpenseDTO created = expenseService.create(expenseDTO, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Expense created successfully"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Long userId = getCurrentUserId();
        List<ExpenseDTO> expenses = expenseService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/range")
    public ResponseEntity<Map<String, Object>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        Long userId = getCurrentUserId();
        List<ExpenseDTO> expenses = expenseService.getByUserAndDateRange(userId, start, end);
        return ResponseEntity.ok(ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        Long userId = getCurrentUserId();
        String csv = expenseService.exportCsv(userId);
        String filename = "expenses-" + LocalDate.now() + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        return new ResponseEntity<>(csv.getBytes(StandardCharsets.UTF_8), headers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        ExpenseDTO expense = expenseService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(expense, "Expense retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody ExpenseDTO expenseDTO) {
        ExpenseDTO updated = expenseService.update(id, expenseDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Expense updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Expense deleted successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getId();
    }
}
