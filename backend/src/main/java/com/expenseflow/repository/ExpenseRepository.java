package com.expenseflow.repository;

import com.expenseflow.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
    List<Expense> findTop10ByUserIdOrderByDateDesc(Long userId);
    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :start AND :end")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT c.name, SUM(e.amount) FROM Expense e JOIN e.category c WHERE e.user.id = :userId GROUP BY c.name")
    List<Object[]> sumAmountByCategoryName(@Param("userId") Long userId);
}
