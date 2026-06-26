# Rules Payloads

Use these as starting points only. Always discover trigger and step contracts
before using a payload.

## Create Inactive Manual Rule

```json
{
  "name": "Manual webhook test",
  "category": "integration",
  "description": "Sends a test payload to the integration webhook.",
  "isActive": false,
  "scope": "ORGANIZATION",
  "trigger": {
    "type": "MANUAL",
    "config": {}
  },
  "steps": [
    {
      "type": "CALL_WEBHOOK",
      "position": 0,
      "name": "Call integration webhook",
      "config": {
        "url": "https://example.com/webhook",
        "method": "POST",
        "body": {
          "source": "{{ trigger.data.source }}",
          "recordId": "{{ trigger.data.recordId }}"
        }
      }
    }
  ]
}
```

```bash
opero rules create --body-file rule.json
```

## Activate Rule

```json
{
  "isActive": true
}
```

```bash
opero rules update <ruleId> --body-file activate.json
```

## Disable Rule

```json
{
  "isActive": false
}
```

```bash
opero rules update <ruleId> --body-file disable.json
```

## Manual Execute

```json
{
  "data": {
    "source": "external-system",
    "recordId": "rec_123",
    "amount": 12500
  }
}
```

```bash
opero rules execute <ruleId> --body-file execute.json
```

## Context Schema Draft

```json
{
  "triggerType": "MANUAL",
  "steps": [
    {
      "type": "RUN_SCRIPT",
      "position": 0,
      "contextKey": "message",
      "config": {
        "code": "return `Source: ${context.trigger.data.source}`;"
      }
    }
  ]
}
```

```bash
opero --json rules context-schemas --body-file context-draft.json
```

## Validate Rule Script

```json
{
  "code": "return context.trigger.data.amount > 10000;"
}
```

```bash
opero --json rules validate-script --body-file script.json
```

## Record Update Rule Skeleton

Use `rules config`, `rules step-types`, and `rules entity-fields` before filling
the exact `objectId`, trigger config, and update config.

```json
{
  "name": "Review high value record",
  "category": "records",
  "isActive": false,
  "trigger": {
    "type": "RECORD_UPDATED",
    "objectId": "dynamic-object-id",
    "config": {
      "updateType": "all"
    }
  },
  "steps": [
    {
      "type": "CONDITION",
      "position": 0,
      "name": "Only high value records",
      "config": {
        "value1": "{{ trigger.data.value }}",
        "operator": "GREATER_THAN",
        "value2": "10000"
      },
      "onFailure": "stop"
    },
    {
      "type": "RUN_SCRIPT",
      "position": 1,
      "name": "Prepare message",
      "contextKey": "message",
      "config": {
        "code": "return `High value record: ${context.trigger.data.name}`;"
      }
    }
  ]
}
```
