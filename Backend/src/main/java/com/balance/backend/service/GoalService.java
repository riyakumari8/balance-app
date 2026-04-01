package com.balance.backend.service;

import com.balance.backend.model.Goal;
import com.balance.backend.model.User;
import com.balance.backend.repository.GoalRepository;
import com.balance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<Goal> getUserGoals(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Goal addGoal(String email, Goal goalReq) {
        User user = userRepository.findByEmail(email).orElseThrow();
        goalReq.setUser(user);
        return goalRepository.save(goalReq);
    }

    public Goal updateGoalAmount(String email, Long goalId, java.math.BigDecimal addition) {
        Goal goal = goalRepository.findById(goalId).orElseThrow();
        if(!goal.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        goal.setCurrentAmount(goal.getCurrentAmount().add(addition));
        return goalRepository.save(goal);
    }

    public void deleteGoal(String email, Long goalId) {
        Goal goal = goalRepository.findById(goalId).orElseThrow();
        if(!goal.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        goalRepository.deleteById(goalId);
    }
}
