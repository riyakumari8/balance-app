package com.balance.backend.service;

import com.balance.backend.model.Expense;
import com.balance.backend.model.User;
import com.balance.backend.repository.ExpenseRepository;
import com.balance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<Expense> getUserExpenses(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return expenseRepository.findByUserIdOrderByDateDesc(user.getId());
    }

    public Expense addExpense(String email, Expense expenseReq) {
        User user = userRepository.findByEmail(email).orElseThrow();
        expenseReq.setUser(user);
        return expenseRepository.save(expenseReq);
    }

    public void deleteExpense(String email, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow();
        if(!expense.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        expenseRepository.deleteById(expenseId);
    }
}
