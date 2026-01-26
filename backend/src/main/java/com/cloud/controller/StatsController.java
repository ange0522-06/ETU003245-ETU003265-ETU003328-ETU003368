package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.cloud.model.Issue;
import com.cloud.service.IssueService;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final IssueService issueService;

    public StatsController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Issue> issues = issueService.getAllIssues();
        int nbPoints = issues.size();
        double totalSurface = issues.stream().mapToDouble(i -> i.getSurface() != null ? i.getSurface() : 0).sum();
        double totalBudget = issues.stream().mapToDouble(i -> i.getBudget() != null ? i.getBudget() : 0).sum();
        long nbTermine = issues.stream().filter(i -> "termine".equalsIgnoreCase(i.getStatus())).count();
        int avancement = nbPoints > 0 ? (int) Math.round((nbTermine * 100.0) / nbPoints) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("nbPoints", nbPoints);
        stats.put("totalSurface", totalSurface);
        stats.put("avancement", avancement);
        stats.put("totalBudget", totalBudget);
        return ResponseEntity.ok(stats);
    }
}
