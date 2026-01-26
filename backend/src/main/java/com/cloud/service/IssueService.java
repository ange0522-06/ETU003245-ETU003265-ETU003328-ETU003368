package com.cloud.service;

import com.cloud.model.Issue;
import com.cloud.repository.IssueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueService {
    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    public Issue addIssue(Issue issue) {
        return issueRepository.save(issue);
    }
}
