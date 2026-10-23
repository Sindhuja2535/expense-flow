package com.expenseflow.service;

import com.expenseflow.dto.NotificationDTO;
import com.expenseflow.entity.Notification;
import com.expenseflow.entity.User;
import com.expenseflow.entity.enums.NotificationType;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.NotificationRepository;
import com.expenseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public NotificationDTO create(String title, String message, NotificationType type, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .user(user)
                .build();

        notification = notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    public List<NotificationDTO> getByUser(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<NotificationDTO> result = new ArrayList<>();
        for (Notification notification : notifications) {
            result.add(mapToDTO(notification));
        }
        return result;
    }

    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean updated = false;
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                updated = true;
            }
        }
        if (updated) {
            notificationRepository.saveAll(notifications);
        }
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
