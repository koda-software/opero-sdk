# Payloads

Use these as compact starting points. Always adapt IDs, keys, targets, and
assignment values to discovered data.

## Create Workflow

```json
{
  "key": "sales_invoice_approval",
  "name": "Sales invoice approval",
  "description": "Approval process for sales invoices.",
  "targets": [
    { "type": "SALES_INVOICE" }
  ]
}
```

## Save Draft

```json
{
  "definition": {
    "targets": [
      { "type": "SALES_INVOICE" }
    ],
    "stages": [
      {
        "key": "draft",
        "name": "Draft",
        "category": "DRAFT",
        "position": 0,
        "isInitial": true,
        "assignmentConfig": {
          "assignmentMode": "single"
        }
      },
      {
        "key": "review",
        "name": "Review",
        "taskName": "Review invoice",
        "category": "ACTIVE",
        "position": 1,
        "assignmentConfig": {
          "assignmentMode": "single",
          "assignee": { "type": "role", "id": "role_id" }
        }
      },
      {
        "key": "approved",
        "name": "Approved",
        "category": "APPROVED",
        "position": 2,
        "isTerminal": true,
        "isReadOnly": true
      }
    ],
    "transitions": [
      {
        "key": "submit_for_review",
        "name": "Submit for review",
        "fromStageKey": "draft",
        "toStageKey": "review",
        "position": 0
      },
      {
        "key": "approve",
        "name": "Approve",
        "fromStageKey": "review",
        "toStageKey": "approved",
        "position": 0,
        "requiredComment": false
      }
    ]
  }
}
```

## Publish

```json
{
  "summary": "Publish initial approval workflow."
}
```

## Start Instance

```json
{
  "workflowId": "workflow_id",
  "metadata": {
    "source": "api"
  }
}
```

## Execute Transition

```json
{
  "comment": "Approved after review.",
  "payload": {},
  "assignee": { "type": "membership", "id": "membership_id" }
}
```

## Update Author

```json
{
  "authorUserId": "user_id"
}
```

Use `null` to clear the author when that is explicitly requested.

## Reassign Task

```json
{
  "assignee": { "type": "role", "id": "role_id" }
}
```
