# GitHub Issue Creation Guide

## Issue #21: Event Sourcing & GraphQL

### GitHub Issue Details

- **Title**: `Event Sourcing & GraphQL`
- **Labels**: `phase-4`, `feature`
- **Assignee**: `Copilot` (GitHub username to be assigned)
- **Milestone**: `Phase 4 - Distributed State & Events`

### Issue Body

Copy the entire content from `issues/issue-21-event-sourcing-graphql.md` into the GitHub issue body.

### Manual Creation Steps

1. Go to https://github.com/Baragji/ai-app-platform/issues/new
2. Set title: `Event Sourcing & GraphQL`
3. Copy content from `issues/issue-21-event-sourcing-graphql.md`
4. Add labels: `phase-4`, `feature`
5. Assign to: Copilot
6. Set milestone: Phase 4 - Distributed State & Events
7. Click "Create issue"

### CLI Creation (if using GitHub CLI)

```bash
gh issue create \
  --title "Event Sourcing & GraphQL" \
  --body-file "issues/issue-21-event-sourcing-graphql.md" \
  --label "phase-4,feature" \
  --assignee "Copilot" \
  --milestone "Phase 4 - Distributed State & Events"
```

### API Creation (if using GitHub API)

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Baragji/ai-app-platform/issues \
  -d '{
    "title": "Event Sourcing & GraphQL",
    "body": "$(cat issues/issue-21-event-sourcing-graphql.md)",
    "labels": ["phase-4", "feature"],
    "assignees": ["Copilot"]
  }'
```

### Issue Number

This should be assigned issue number **#21** based on the roadmap sequence.
