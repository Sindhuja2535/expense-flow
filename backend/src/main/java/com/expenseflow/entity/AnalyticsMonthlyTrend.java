package com.expenseflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_monthly_trends")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsMonthlyTrend {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "month")
    private String month;

    @Column(name = "total_spent")
    private BigDecimal totalSpent;

    @Column(name = "transactions")
    private Long transactions;

    @Column(name = "avg_expense")
    private BigDecimal avgExpense;
}
