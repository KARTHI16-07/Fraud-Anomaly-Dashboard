package com.example.fraud.controller;

import com.example.fraud.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final TransactionRepository repository;
    public DashboardController(TransactionRepository repository) { this.repository = repository; }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long total = repository.count();
        long suspicious = repository.findByStatusOrderByTimestampDesc("SUSPICIOUS").size();
        return Map.of("total", total, "normal", total - suspicious, "suspicious", suspicious,
            "suspiciousPercentage", total == 0 ? 0.0 : Math.round(suspicious * 1000.0 / total) / 10.0);
    }

    @GetMapping("/activity")
    public List<Map<String, Object>> activity() {
        LocalDate today = LocalDate.now();
        Map<LocalDate, List<com.example.fraud.entity.Transaction>> grouped = repository.findAll().stream()
            .collect(Collectors.groupingBy(t -> t.getTimestamp().toLocalDate()));
        List<Map<String, Object>> days = new ArrayList<>();
        for (int offset = 6; offset >= 0; offset--) {
            LocalDate day = today.minusDays(offset);
            List<com.example.fraud.entity.Transaction> rows = grouped.getOrDefault(day, List.of());
            days.add(Map.of("date", day.toString(), "total", rows.size(),
                "normal", rows.stream().filter(t -> "NORMAL".equals(t.getStatus())).count(),
                "suspicious", rows.stream().filter(t -> "SUSPICIOUS".equals(t.getStatus())).count(),
                "amount", rows.stream().mapToDouble(com.example.fraud.entity.Transaction::getAmount).sum()));
        }
        return days;
    }
}
