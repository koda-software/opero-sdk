# Execution And Debugging

## Manual Execution

Manual execution works for active rules whose trigger type is `MANUAL`.

```bash
opero rules execute <ruleId> --body-file execute.json
```

For organization tokens, use `opero companies select <companyId>`, pass
`--company-id <companyId>`, or set `OPERO_COMPANY_ID` when the rule execution
reads or mutates company-scoped runtime data.

Payload:

```json
{
  "data": {
    "source": "external-system",
    "recordId": "rec_123",
    "amount": 12500
  }
}
```

The `data` object becomes available as `trigger.data`.

Do not execute a rule unless the user approves the side effects. Manual
execution can still send email, call webhooks, update records, generate
documents, or call other rules.

## Execution History

List recent executions:

```bash
opero --json rules executions <ruleId> --limit 10
```

Read one execution:

```bash
opero --json rules execution <ruleId> <executionId>
```

Useful execution fields include:

- `status`
- `error`
- `durationMs`
- `failedStepId`
- `failedStepPosition`
- `contextSnapshot`
- `executedAt`

## Debugging Flow

1. Read the failed execution.
2. Note `failedStepPosition`.
3. Read the saved rule.
4. Find the step with the same `position`.
5. Compare the step config or script with `contextSnapshot`.
6. For script/template issues, inspect context before that step.
7. Patch the rule.
8. Test again only when the user approves side effects.

Commands:

```bash
opero --json rules execution <ruleId> <executionId>
opero --json rules get <ruleId>
opero --json rules context-schema <ruleId> --step-position <n>
```

## Common Failure Areas

- Step config does not match the current step-type contract.
- A template or script references a missing context path.
- A `goto:N` target does not exist.
- A record or field referenced by config was renamed or deleted.
- A rule calls another inactive or failing rule.
- A manual rule was executed while inactive or without a `MANUAL` trigger.
- The token lacks the needed read, manage, or execute permission.
