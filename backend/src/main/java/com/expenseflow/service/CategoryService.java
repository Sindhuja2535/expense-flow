package com.expenseflow.service;

import com.expenseflow.dto.CategoryDTO;
import com.expenseflow.entity.Category;
import com.expenseflow.entity.User;
import com.expenseflow.entity.enums.CategoryType;
import com.expenseflow.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.expenseflow.repository.CategoryRepository;
import com.expenseflow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        seedDefaultCategories();
    }

    public CategoryDTO create(CategoryDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = Category.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .color(dto.getColor())
                .type(CategoryType.valueOf(dto.getType()))
                .isDefault(false)
                .user(user)
                .build();

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    public List<CategoryDTO> getByUser(Long userId) {
        List<Category> userCategories = categoryRepository.findByUserId(userId);
        List<Category> defaultCategories = categoryRepository.findByUserIdIsNullAndType(CategoryType.EXPENSE);
        List<Category> defaultIncomeCategories = categoryRepository.findByUserIdIsNullAndType(CategoryType.INCOME);

        List<Category> allCategories = new ArrayList<>();
        allCategories.addAll(userCategories);
        allCategories.addAll(defaultCategories);
        allCategories.addAll(defaultIncomeCategories);

        List<CategoryDTO> result = new ArrayList<>();
        for (Category cat : allCategories) {
            result.add(mapToDTO(cat));
        }
        return result;
    }

    public CategoryDTO getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapToDTO(category);
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getIcon() != null) {
            category.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            category.setColor(dto.getColor());
        }
        if (dto.getType() != null) {
            category.setType(CategoryType.valueOf(dto.getType()));
        }

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private void seedDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> defaults = List.of(
                    Category.builder().name("Food").icon("restaurant").color("#FF5722").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Transport").icon("directions_car").color("#2196F3").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Entertainment").icon("movie").color("#9C27B0").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Shopping").icon("shopping_cart").color("#E91E63").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Bills").icon("receipt").color("#FF9800").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Health").icon("health_and_safety").color("#4CAF50").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Education").icon("school").color("#00BCD4").type(CategoryType.EXPENSE).isDefault(true).build(),
                    Category.builder().name("Salary").icon("payments").color("#4CAF50").type(CategoryType.INCOME).isDefault(true).build(),
                    Category.builder().name("Freelance").icon("work").color("#2196F3").type(CategoryType.INCOME).isDefault(true).build(),
                    Category.builder().name("Investments").icon("trending_up").color("#FF9800").type(CategoryType.INCOME).isDefault(true).build()
            );
            categoryRepository.saveAll(defaults);
        }
    }

    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .type(category.getType().name())
                .isDefault(category.isDefault())
                .build();
    }
}
