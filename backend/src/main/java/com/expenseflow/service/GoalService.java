package com.expenseflow.service;

import com.expenseflow.dto.GoalDTO;
import com.expenseflow.entity.Goal;
import com.expenseflow.entity.User;
import com.expenseflow.exception.GlobalExceptionHandler.BadRequestException;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.GoalRepository;
import com.expenseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    public GoalDTO create(GoalDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Goal goal = Goal.builder()
                .name(dto.getName())
                .targetAmount(dto.getTargetAmount())
                .currentAmount(dto.getCurrentAmount() != null ? dto.getCurrentAmount() : BigDecimal.ZERO)
                .deadline(dto.getDeadline())
                .icon(dto.getIcon())
                .color(dto.getColor())
                .isCompleted(false)
                .user(user)
                .build();

        goal = goalRepository.save(goal);
        return mapToDTO(goal);
    }

    public List<GoalDTO> getByUser(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        List<GoalDTO> result = new ArrayList<>();
        for (Goal goal : goals) {
            result.add(mapToDTO(goal));
        }
        return result;
    }

    public GoalDTO getById(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        return mapToDTO(goal);
    }

    public GoalDTO update(Long id, GoalDTO dto) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (dto.getName() != null) {
            goal.setName(dto.getName());
        }
        if (dto.getTargetAmount() != null) {
            goal.setTargetAmount(dto.getTargetAmount());
        }
        if (dto.getCurrentAmount() != null) {
            goal.setCurrentAmount(dto.getCurrentAmount());
        }
        if (dto.getDeadline() != null) {
            goal.setDeadline(dto.getDeadline());
        }
        if (dto.getIcon() != null) {
            goal.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            goal.setColor(dto.getColor());
        }

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
        }

        goal = goalRepository.save(goal);
        return mapToDTO(goal);
    }

    public GoalDTO updateProgress(Long id, BigDecimal amount) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be positive");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
            goal.setCurrentAmount(goal.getTargetAmount());
        }

        goal = goalRepository.save(goal);
        return mapToDTO(goal);
    }

    public void delete(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalDTO mapToDTO(Goal goal) {
        return GoalDTO.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .deadline(goal.getDeadline())
                .icon(goal.getIcon())
                .color(goal.getColor())
                .isCompleted(goal.isCompleted())
                .build();
    }
}
