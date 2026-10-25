package com.expenseflow.controller;

import com.expenseflow.entity.AnalyticsCategoryTrend;
import com.expenseflow.entity.AnalyticsMonthlyTrend;
import com.expenseflow.repository.AnalyticsCategoryTrendRepository;
import com.expenseflow.repository.AnalyticsMonthlyTrendRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsMonthlyTrendRepository monthlyRepo;
    private final AnalyticsCategoryTrendRepository categoryRepo;

    public AnalyticsController(AnalyticsMonthlyTrendRepository monthlyRepo, AnalyticsCategoryTrendRepository categoryRepo) {
        this.monthlyRepo = monthlyRepo;
        this.categoryRepo = categoryRepo;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh() {
        Map<String, Object> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "C:/Users/alesh/portfolio/analytics/run_analytics_final.bat");
            pb.directory(new java.io.File("C:/Users/alesh/portfolio"));
            pb.redirectErrorStream(true);
            pb.start();
            result.put("success", true);
            result.put("message", "Analytics refresh triggered");
            return ResponseEntity.accepted().body(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> results() {
        Map<String, Object> result = new HashMap<>();
        List<AnalyticsMonthlyTrend> monthly = monthlyRepo.findAll();
        List<AnalyticsCategoryTrend> category = categoryRepo.findAll();
        result.put("monthly", monthly);
        result.put("category", category);
        result.put("monthlyCount", monthly.size());
        result.put("categoryCount", category.size());
        return ResponseEntity.ok(result);
    }
}
