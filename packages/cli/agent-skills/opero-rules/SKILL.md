---
name: opero-rules
description: Use when creating, updating, reviewing, deleting, executing, debugging, or explaining Opero automation rules, including rule triggers, ordered steps, step configs, context keys, context schemas, RUN_SCRIPT rule steps, manual execution, execution history, and related-rule impact checks for custom modules, objects, and fields.
---

# Opero Rules

Use this skill for Opero automation rules. Rules react to events or manual
execution and run ordered automation steps such as conditions, scripts, record
updates, webhooks, email, saved queries, AI, waits, or calls to other rules.

Rules are not workflows. Workflows model long-running state, stages, tasks, and
transitions. Rules are event/manual automations with ordered side effects.

## References

Read only the reference needed for the task:

- `references/concepts.md`: rule model, triggers, steps, context keys, branching,
  permissions, and workflow boundary.
- `references/discovery.md`: builder metadata, trigger/step discovery, entity
  fields, existing rules, and related-rule lookup.
- `references/authoring.md`: safe create/update/delete procedure, inactive-first
  authoring, ordering, branching, and approval.
- `references/context-and-scripts.md`: context schemas for drafts and saved
  rules, `RUN_SCRIPT` validation, and boundary with Custom Scripts.
- `references/execution-and-debugging.md`: manual execution, execution history,
  failed-step diagnosis, and runtime context snapshots.
- `references/impact-and-safety.md`: side effects, destructive changes,
  related-rule checks, activation, and permissions.
- `references/payloads.md`: compact payload examples for common rules commands.

## Before You Start

Before changing a rule:

- Know what should start the rule.
- Know what actions the rule should perform.
- Know which records, fields, users, or external systems it may affect.
- Read existing rule state before editing.
- Load builder metadata before inventing trigger or step config.
- For rule scripts, inspect context before writing code.

Before create, update, execute, activate, or delete, summarize:

```text
I will change this rule:
- Rule: ...
- Starts when: ...
- Steps: ...
- Side effects: ...
- Test/check: ...
```

Do not create, update, activate, execute, or delete until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless recent context proves auth and API
   reachability.
2. Read `references/discovery.md` and load builder metadata:

   ```bash
   opero --json rules config
   opero --json rules step-types
   ```

3. Inspect existing rules before creating or editing:

   ```bash
   opero --json rules list --limit 50
   opero --json rules get <ruleId>
   ```

4. For rules involving custom records or fields, inspect available rule fields:

   ```bash
   opero --json rules entity-fields --entity-type custom_record --module-key <moduleKey> --object-key <objectKey>
   ```

5. For unsaved drafts, compute context before saving:

   ```bash
   opero --json rules context-schemas --body-file draft.json
   ```

6. For saved rules, inspect context before the step being edited:

   ```bash
   opero --json rules context-schema <ruleId> --step-position <n>
   ```

7. For `RUN_SCRIPT` steps, validate the code:

   ```bash
   opero --json rules validate-script --body-file script.json
   ```

8. For new side-effect rules, create inactive first, read back, review, then
   activate only after approval.
9. Verify with `rules get`, `rules executions`, or manual execution for manual
   rules.

## Rules

- Do not hard-code trigger or step config. Use `rules config`, `rules
  step-types`, and `rules entity-fields`.
- Use clear numeric step positions. Keep `goto:N` targets valid.
- Use stable `contextKey` values and do not reuse one key for different data.
- Do not use reserved context keys: `trigger`, `organization`, `__depth`,
  `__ruleLineage`, `__error`, or `__skip`.
- Keep new side-effect rules inactive until reviewed.
- Treat activation, manual execution, update, and delete as live changes.
- Use `opero-scripts` for detailed `RUN_SCRIPT` code authoring, but keep rule
  shape and context discovery in this skill.
