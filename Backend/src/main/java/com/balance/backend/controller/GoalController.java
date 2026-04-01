package com.balance.backend.controller;

import com.balance.backend.model.Goal;
import com.balance.backend.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(goalService.getUserGoals(email));
    }

    @PostMapping
    public ResponseEntity<Goal> addGoal(@RequestBody Goal goal) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(goalService.addGoal(email, goal));
    }

    @PutMapping("/{id}/add")
    public ResponseEntity<Goal> addAmountToGoal(@PathVariable Long id, @RequestParam BigDecimal amount) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(goalService.updateGoalAmount(email, id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        goalService.deleteGoal(email, id);
        return ResponseEntity.ok().build();
    }
}
