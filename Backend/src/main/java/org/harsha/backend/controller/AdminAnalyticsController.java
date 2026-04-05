package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.Order;
import org.harsha.backend.repository.OrderRepository;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        
        // 1 & 2 & 3: Instant Database Aggregations (O(1) Memory Usage)
        long totalRevenue = orderRepository.calculateTotalActiveRevenue();
        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.count();

        // 4. Low Stock Items - Fetches ONLY 5 rows from DB instantly
        List<Map<String, Object>> lowStockItems = productRepository
                .findTop5ByQuantityLessThanEqualOrderByQuantityAsc(5)
                .stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("name", p.getTitle());
                    map.put("stock", p.getQuantity());
                    map.put("brand", p.getBrand());
                    return map;
                })
                .collect(Collectors.toList());

        // 5. Pending Orders - Fetches ONLY 5 rows from DB instantly
        List<Map<String, Object>> pendingOrders = orderRepository
                .findTop5ByOrderStatusInOrderByCreatedAtDesc(Arrays.asList("PLACED", "RETURN_REQUESTED"))
                .stream()
                .map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getId());
                    map.put("status", o.getOrderStatus());
                    map.put("total", o.getTotalDiscountedPrice());
                    return map;
                })
                .collect(Collectors.toList());

        // Build Response
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("totalOrders", totalOrders);
        response.put("totalCustomers", totalCustomers);
        response.put("lowStockItems", lowStockItems);
        response.put("pendingOrders", pendingOrders);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/charts")
    public ResponseEntity<Map<String, Object>> getChartData() {
        // Optimized: Only fetch non-cancelled orders from the database
        List<Order> validOrders = orderRepository.findAllValidOrders();

        Map<String, Object> response = new HashMap<>();

        // Weekly Data (Mon - Sun of current week)
        response.put("weekly", generateWeeklyData(validOrders));

        // Monthly Data (Week 1 - Week 4 of current month)
        response.put("monthly", generateMonthlyData(validOrders));

        // Yearly Data (Jan - Dec of current year)
        response.put("yearly", generateYearlyData(validOrders));

        return ResponseEntity.ok(response);
    }

    // Helper: Group by Day of Week
    private List<Map<String, Object>> generateWeeklyData(List<Order> orders) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        Map<DayOfWeek, Double> revenueByDay = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(oneWeekAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getDayOfWeek(),
                        Collectors.summingDouble(Order::getTotalDiscountedPrice)
                ));

        Map<DayOfWeek, Long> ordersByDay = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(oneWeekAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getDayOfWeek(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> weeklyData = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", day.name().substring(0, 3).toUpperCase(Locale.ROOT));
            map.put("revenue", revenueByDay.getOrDefault(day, 0.0));
            map.put("orders", ordersByDay.getOrDefault(day, 0L));
            weeklyData.add(map);
        }
        return weeklyData;
    }

    // Helper: Group by Month of Year
    private List<Map<String, Object>> generateYearlyData(List<Order> orders) {
        int currentYear = LocalDateTime.now().getYear();

        Map<Month, Double> revenueByMonth = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getMonth(),
                        Collectors.summingDouble(Order::getTotalDiscountedPrice)
                ));

        Map<Month, Long> ordersByMonth = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getMonth(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> yearlyData = new ArrayList<>();
        for (Month month : Month.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", month.name().substring(0, 3).toUpperCase(Locale.ROOT));
            map.put("revenue", revenueByMonth.getOrDefault(month, 0.0));
            map.put("orders", ordersByMonth.getOrDefault(month, 0L));
            yearlyData.add(map);
        }
        return yearlyData;
    }

    // Helper: Simple Monthly Data (Split into 4 weeks)
    private List<Map<String, Object>> generateMonthlyData(List<Order> orders) {
        int currentMonth = LocalDateTime.now().getMonthValue();
        int currentYear = LocalDateTime.now().getYear();

        List<Order> thisMonthOrders = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getMonthValue() == currentMonth && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", "Week " + i);

            double qRev = thisMonthOrders.stream().mapToDouble(Order::getTotalDiscountedPrice).sum() / 4.0;
            long qOrd = thisMonthOrders.size() / 4;

            map.put("revenue", Math.round(qRev));
            map.put("orders", qOrd);
            monthlyData.add(map);
        }
        return monthlyData;
    }
}