package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.OrderItem;
import org.harsha.backend.repository.OrderRepository;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // DASHBOARD — KPIs + tables, filtered by timeframe
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics(
            @RequestParam(defaultValue = "all") String timeframe) {

        // Resolve start-of-window from timeframe param
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = switch (timeframe) {
            case "weekly"  -> now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                                 .toLocalDate().atStartOfDay();
            case "monthly" -> now.withDayOfMonth(1).toLocalDate().atStartOfDay();
            case "yearly"  -> now.withDayOfYear(1).toLocalDate().atStartOfDay();
            default        -> LocalDateTime.of(2000, 1, 1, 0, 0); 
        };

        // Valid (non-cancelled) orders within the time window
        List<Order> windowOrders = orderRepository.findAllValidOrders()
                .stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(from))
                .collect(Collectors.toList());

        // KPIs 
        long totalRevenue    = windowOrders.stream()
                .mapToLong(o -> (long) o.getTotalDiscountedPrice()).sum();
        long totalOrders     = windowOrders.size();
        double avgOrderValue = totalOrders > 0 ? (double) totalRevenue / totalOrders : 0;

        long returnCount = windowOrders.stream()
                .filter(o -> List.of("RETURN_REQUESTED", "RETURNED").contains(o.getOrderStatus()))
                .count();
        double returnRate = totalOrders > 0
                ? Math.round((returnCount * 100.0 / totalOrders) * 10.0) / 10.0
                : 0;

        // totalCustomers is always all-time — registrations aren't time-windowed
        long totalCustomers = userRepository.count();

        // Order Status Distribution 
        Map<String, Long> statusMap = windowOrders.stream()
                .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.counting()));

        List<Map<String, Object>> orderStatusDistribution = statusMap.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("status", entry.getKey());
                    m.put("count",  entry.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Top Products 
        Map<Long, long[]> productAggregates = new LinkedHashMap<>();
        for (Order order : windowOrders) {
            if (order.getOrderItems() == null) continue;
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() == null) continue;
                long pid = item.getProduct().getId();
                productAggregates.putIfAbsent(pid, new long[]{0, 0});
                productAggregates.get(pid)[0] += item.getQuantity();
                productAggregates.get(pid)[1] += (long) item.getDiscountedPrice() * item.getQuantity();
            }
        }

        List<Map<String, Object>> topProducts = productAggregates.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[1], a.getValue()[1]))
                .limit(5)
                .map(entry -> {
                    var product = productRepository.findById(entry.getKey()).orElse(null);
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",        entry.getKey());
                    m.put("name",      product != null ? product.getTitle() : "Unknown");
                    m.put("category",  product != null && product.getCategory() != null
                            ? product.getCategory().getName().toUpperCase() : "—");
                    m.put("unitsSold", entry.getValue()[0]);
                    m.put("revenue",   entry.getValue()[1]);
                    return m;
                })
                .collect(Collectors.toList());

        // Recent Transactions (always latest 10 — not window-filtered) 
        List<Map<String, Object>> recentTransactions = orderRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",           o.getId());
                    m.put("customerName", o.getUser() != null
                            ? o.getUser().getFirstName() + " " + o.getUser().getLastName()
                            : "Guest");
                    m.put("amount", o.getTotalDiscountedPrice());
                    m.put("status", o.getOrderStatus());
                    m.put("date",   o.getCreatedAt() != null ? o.getCreatedAt().toString() : "—");
                    return m;
                })
                .collect(Collectors.toList());

        // Category Revenue 
        Map<String, Long> categoryRevenueMap = new LinkedHashMap<>();
        for (Order order : windowOrders) {
            if (order.getOrderItems() == null) continue;
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() == null || item.getProduct().getCategory() == null) continue;
                String catName     = item.getProduct().getCategory().getName().toUpperCase();
                long   itemRevenue = (long) item.getDiscountedPrice() * item.getQuantity();
                categoryRevenueMap.merge(catName, itemRevenue, Long::sum);
            }
        }

        List<Map<String, Object>> categoryRevenue = categoryRevenueMap.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(6)
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", entry.getKey());
                    m.put("revenue",  entry.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Low Stock (always all-time — stock level is not time-dependent) 
        List<Map<String, Object>> lowStockItems = productRepository
                .findTop5ByQuantityLessThanEqualOrderByQuantityAsc(5)
                .stream()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",    p.getId());
                    m.put("name",  p.getTitle());
                    m.put("stock", p.getQuantity());
                    m.put("brand", p.getBrand());
                    return m;
                })
                .collect(Collectors.toList());

        // Pending Directives (always latest — not window-filtered) 
        List<Map<String, Object>> pendingOrders = orderRepository
                .findTop5ByOrderStatusInOrderByCreatedAtDesc(
                        Arrays.asList("PLACED", "RETURN_REQUESTED"))
                .stream()
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",     o.getId());
                    m.put("status", o.getOrderStatus());
                    m.put("total",  o.getTotalDiscountedPrice());
                    return m;
                })
                .collect(Collectors.toList());

        // Assemble & return 
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue",            totalRevenue);
        response.put("totalOrders",             totalOrders);
        response.put("totalCustomers",          totalCustomers);
        response.put("avgOrderValue",           Math.round(avgOrderValue));
        response.put("returnRate",              returnRate);
        response.put("orderStatusDistribution", orderStatusDistribution);
        response.put("topProducts",             topProducts);
        response.put("recentTransactions",      recentTransactions);
        response.put("categoryRevenue",         categoryRevenue);
        response.put("lowStockItems",           lowStockItems);
        response.put("pendingOrders",           pendingOrders);

        return ResponseEntity.ok(response);
    }

    // CHARTS — Revenue trend (unchanged)
    @GetMapping("/charts")
    public ResponseEntity<Map<String, Object>> getChartData() {
        List<Order> validOrders = orderRepository.findAllValidOrders();

        Map<String, Object> response = new HashMap<>();
        response.put("weekly",  generateWeeklyData(validOrders));
        response.put("monthly", generateMonthlyData(validOrders));
        response.put("yearly",  generateYearlyData(validOrders));

        return ResponseEntity.ok(response);
    }

    // Chart helpers 
    private List<Map<String, Object>> generateWeeklyData(List<Order> orders) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        Map<DayOfWeek, Double> revenueByDay = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(oneWeekAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getDayOfWeek(),
                        Collectors.summingDouble(Order::getTotalDiscountedPrice)));

        Map<DayOfWeek, Long> ordersByDay = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(oneWeekAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getDayOfWeek(),
                        Collectors.counting()));

        List<Map<String, Object>> weeklyData = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name",    day.name().substring(0, 3).toUpperCase(Locale.ROOT));
            map.put("revenue", revenueByDay.getOrDefault(day, 0.0));
            map.put("orders",  ordersByDay.getOrDefault(day, 0L));
            weeklyData.add(map);
        }
        return weeklyData;
    }

    private List<Map<String, Object>> generateYearlyData(List<Order> orders) {
        int currentYear = LocalDateTime.now().getYear();

        Map<Month, Double> revenueByMonth = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getMonth(),
                        Collectors.summingDouble(Order::getTotalDiscountedPrice)));

        Map<Month, Long> ordersByMonth = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getMonth(),
                        Collectors.counting()));

        List<Map<String, Object>> yearlyData = new ArrayList<>();
        for (Month month : Month.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name",    month.name().substring(0, 3).toUpperCase(Locale.ROOT));
            map.put("revenue", revenueByMonth.getOrDefault(month, 0.0));
            map.put("orders",  ordersByMonth.getOrDefault(month, 0L));
            yearlyData.add(map);
        }
        return yearlyData;
    }

    private List<Map<String, Object>> generateMonthlyData(List<Order> orders) {
        int currentMonth = LocalDateTime.now().getMonthValue();
        int currentYear  = LocalDateTime.now().getYear();

        List<Order> thisMonthOrders = orders.stream()
                .filter(o -> o.getCreatedAt() != null
                        && o.getCreatedAt().getMonthValue() == currentMonth
                        && o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", "Week " + i);
            double qRev = thisMonthOrders.stream()
                    .mapToDouble(Order::getTotalDiscountedPrice).sum() / 4.0;
            long qOrd = thisMonthOrders.size() / 4;
            map.put("revenue", Math.round(qRev));
            map.put("orders",  qOrd);
            monthlyData.add(map);
        }
        return monthlyData;
    }
}