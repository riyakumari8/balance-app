package com.balance.backend.controller;

import com.balance.backend.model.Budget;
import com.balance.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/{year}/{month}")
    public ResponseEntity<Budget> getBudget(@PathVariable int year, @PathVariable int month) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Budget budget = budgetService.getBudgetForMonth(email, month, year);
        if(budget == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(budget);
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(@RequestBody Budget budget) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(budgetService.setBudget(email, budget));
    }
}
