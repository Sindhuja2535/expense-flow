package com.expenseflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "analytics_category_trends")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsCategoryTrend {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category")
    private String category;

    @Column(name = "total_spent")
    private BigDecimal totalSpent;

    @Column(name = "transactions")
    private Long transactions;

    @Column(name = "avg_expense")
    private BigDecimal avgExpense;
}
