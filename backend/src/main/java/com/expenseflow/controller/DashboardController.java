package com.expenseflow.controller;

import com.expenseflow.dto.DashboardDTO;
import com.expenseflow.security.UserPrincipal;
import com.expenseflow.service.ExpenseService;
import com.expenseflow.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Long userId = getCurrentUserId();
        DashboardDTO dashboard = expenseService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Dashboard data retrieved successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getId();
    }
}
