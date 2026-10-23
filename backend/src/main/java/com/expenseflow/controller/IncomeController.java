package com.expenseflow.controller;

import com.expenseflow.dto.IncomeDTO;
import com.expenseflow.security.UserPrincipal;
import com.expenseflow.service.IncomeService;
import com.expenseflow.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody IncomeDTO incomeDTO) {
        Long userId = getCurrentUserId();
        IncomeDTO created = incomeService.create(incomeDTO, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Income created successfully"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Long userId = getCurrentUserId();
        List<IncomeDTO> incomes = incomeService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(incomes, "Income records retrieved successfully"));
    }

    @GetMapping("/range")
    public ResponseEntity<Map<String, Object>> getByDateRange(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate end) {
        Long userId = getCurrentUserId();
        List<IncomeDTO> incomes = incomeService.getByUserAndDateRange(userId, start, end);
        return ResponseEntity.ok(ApiResponse.success(incomes, "Income records retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        IncomeDTO income = incomeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(income, "Income retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody IncomeDTO incomeDTO) {
        IncomeDTO updated = incomeService.update(id, incomeDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Income updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        incomeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Income deleted successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getId();
    }
}
