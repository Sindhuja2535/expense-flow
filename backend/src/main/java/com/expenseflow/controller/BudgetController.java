package com.expenseflow.controller;

import com.expenseflow.dto.BudgetDTO;
import com.expenseflow.security.UserPrincipal;
import com.expenseflow.service.BudgetService;
import com.expenseflow.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody BudgetDTO budgetDTO) {
        Long userId = getCurrentUserId();
        BudgetDTO created = budgetService.create(budgetDTO, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Budget created successfully"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Long userId = getCurrentUserId();
        List<BudgetDTO> budgets = budgetService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(budgets, "Budgets retrieved successfully"));
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress() {
        Long userId = getCurrentUserId();
        List<Map<String, Object>> progress = budgetService.getBudgetProgress(userId);
        return ResponseEntity.ok(ApiResponse.success(progress, "Budget progress retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        BudgetDTO budget = budgetService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody BudgetDTO budgetDTO) {
        BudgetDTO updated = budgetService.update(id, budgetDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Budget updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Budget deleted successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getId();
    }
}
