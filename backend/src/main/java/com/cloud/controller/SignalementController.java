package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.cloud.model.Issue;
import com.cloud.service.IssueService;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {
    private final IssueService issueService;

    public SignalementController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public ResponseEntity<List<Issue>> getAllSignalements() {
        List<Issue> signalements = issueService.getAllIssues();
        return ResponseEntity.ok(signalements);
    }
}
