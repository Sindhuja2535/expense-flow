package com.expenseflow.controller;

import com.expenseflow.dto.GoalDTO;
import com.expenseflow.security.UserPrincipal;
import com.expenseflow.service.GoalService;
import com.expenseflow.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody GoalDTO goalDTO) {
        Long userId = getCurrentUserId();
        GoalDTO created = goalService.create(goalDTO, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Goal created successfully"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Long userId = getCurrentUserId();
        List<GoalDTO> goals = goalService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(goals, "Goals retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        GoalDTO goal = goalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(goal, "Goal retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody GoalDTO goalDTO) {
        GoalDTO updated = goalService.update(id, goalDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Goal updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        goalService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Goal deleted successfully"));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal amount = body.get("amount");
        GoalDTO updated = goalService.updateProgress(id, amount);
        return ResponseEntity.ok(ApiResponse.success(updated, "Goal progress updated successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getId();
    }
}
