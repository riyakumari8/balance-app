package com.balance.backend.service;

import com.balance.backend.model.Budget;
import com.balance.backend.model.User;
import com.balance.backend.repository.BudgetRepository;
import com.balance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public Budget getBudgetForMonth(String email, int month, int year) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year).orElse(null);
    }

    public Budget setBudget(String email, Budget budgetReq) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Optional<Budget> existing = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), budgetReq.getMonth(), budgetReq.getYear());
        
        Budget budget = existing.orElse(budgetReq);
        if(existing.isPresent()){
            budget.setAmount(budgetReq.getAmount());
        } else {
            budget.setUser(user);
        }
        
        return budgetRepository.save(budget);
    }
}
