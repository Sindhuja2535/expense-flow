package com.expenseflow.utils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ApiResponse {

    private ApiResponse() {
    }

    public static Map<String, Object> success(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    public static Map<String, Object> error(String message, int status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("status", status);
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}
