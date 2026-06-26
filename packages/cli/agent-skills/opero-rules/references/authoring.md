# Rule Authoring

Rules can send messages, call webhooks, update records, generate documents, call
other rules, or wait. Treat rule create/update/activation as live automation
changes.

## Safe Create Flow

For new rules with side effects:

1. Discover triggers, step types, and fields.
2. Build the complete payload locally.
3. Compute context schemas for the draft.
4. Validate any `RUN_SCRIPT` code.
5. Summarize the trigger, steps, side effects, and test plan.
6. Create with `isActive: false`.
7. Read the saved rule back.
8. Activate only after approval.

```bash
opero rules create --body-file rule.json
opero --json rules get <ruleId>
opero rules update <ruleId> --body-file activate.json
```

## Update Flow

For existing rules:

1. Read the saved rule.
2. Inspect execution history if the change relates to failures.
3. Preserve unrelated trigger and step config.
4. Use context-schema commands for changed script/template steps.
5. Summarize the diff and side effects before updating.
6. Prefer disabling the rule first if an active rule has risky side effects.
7. Patch with the smallest complete body the API accepts.

```bash
opero --json rules get <ruleId>
opero rules update <ruleId> --body-file update.json
```

## Delete Flow

Deleting a rule removes automation behavior. Prefer disabling with
`isActive: false` when the user wants to stop a rule but may need history or
future restoration.

```bash
opero rules update <ruleId> --body-file disable.json
opero rules delete <ruleId>
```

Ask for explicit approval before deleting.

## Step Ordering

Steps run in numeric `position` order. Keep positions unique and easy to scan.
If rewriting the whole step array, preserve behavior unless the user asked for a
change.

## Context Keys

Use descriptive `contextKey` values such as `queryRows`, `preparedMessage`, or
`webhookResponse`. Avoid generic keys like `data` or `result` when the rule has
multiple steps.

Do not use reserved context keys:

- `trigger`
- `organization`
- `__depth`
- `__ruleLineage`
- `__error`
- `__skip`

## Branching

Use `onFailure: "stop"` when later steps should not run after failure.

Use `onFailure: "goto:N"` only when a step with position `N` exists. Explain
the branch in the plan because `goto` changes execution flow.
