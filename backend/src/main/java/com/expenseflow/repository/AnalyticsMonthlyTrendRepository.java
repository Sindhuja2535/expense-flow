package com.expenseflow.repository;

import com.expenseflow.entity.AnalyticsMonthlyTrend;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticsMonthlyTrendRepository extends JpaRepository<AnalyticsMonthlyTrend, Long> {
}
