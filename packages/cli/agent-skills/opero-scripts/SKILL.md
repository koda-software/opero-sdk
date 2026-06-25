---
name: opero-scripts
description: Use when creating, updating, reviewing, validating, archiving, restoring, or explaining Opero custom scripts or automation rule RUN_SCRIPT code, including script types, save-time validation, rule script context schemas, runtime context, dependencies, async behavior, and safe CLI workflows.
---

# Opero Scripts

Use this skill for Opero scripts. The default path is Opero Custom Scripts:
organization-scoped JavaScript function bodies used for UI/runtime behavior such
as filtering field options, hiding fields, setting defaults, gating UI actions,
render hooks, template helpers, and reusable custom script calls.

Also use this skill for automation rule `RUN_SCRIPT` step code. Rule scripts
have separate context-schema and validation commands under `opero rules ...`.

Custom Scripts are not backend security controls. Backend permissions,
validation, required-field checks, workflow rules, and API constraints remain
authoritative.

## References

Read only the reference needed for the task:

- `references/concepts.md`: product model, script registry, bindings, statuses,
  and lifecycle.
- `references/types-and-context.md`: script types, hooks, return values, async
  policy, helper availability, and `ctx` shape.
- `references/cli-workflows.md`: list, inspect, create, update, archive,
  restore, and delete commands.
- `references/validation.md`: save-time validation model, validation errors,
  dependency extraction, and what not to validate with rule commands.
- `references/payloads-and-examples.md`: create/update payload templates and
  script examples by type.
- `references/rule-scripts.md`: automation rule `RUN_SCRIPT` context discovery,
  validation, and the difference from Custom Scripts.

## Before You Start

Before changing a script:

- Understand what the script should do and when it should run.
- Know whether this is a new script or a change to an existing one.
- If changing an existing script, read it first and check whether it is already
  used.
- Know what information the script needs from Opero, and what result it should
  return.
- Make sure the chosen script type supports what the script needs to do.

Before saving, summarize:

```text
I will create/update this script:
- Runs when: ...
- Does: ...
- Uses: ...
- Returns: ...
- Risk: ...
- I will validate it after saving.
```

Do not save, archive, restore, or delete until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless current context already proves auth and API
   reachability.
2. Determine whether the user means a Custom Script or an automation rule
   `RUN_SCRIPT` step. For rule scripts, read `references/rule-scripts.md`.
3. Read `references/types-and-context.md` before writing code that depends on
   `ctx`, async helpers, return values, or hook behavior.
4. Inspect existing scripts before creating a new one:

   ```bash
   opero --json custom-scripts list --limit 50
   ```

5. If modifying an existing script, fetch it first and check `usageCount`,
   `validationStatus`, `dependencies`, and `type`.
6. Prepare JSON payloads in files and use `--body-file`.
7. Create or update the script. Custom Script validation happens during
   create/update and is returned on the saved script response.
8. If `validationStatus` is `INVALID`, inspect `validationErrors`, edit the
   payload, and update the script again.
9. Verify with `opero --json custom-scripts get <id>`.

## Rules

- Do not invent `ctx` fields. Use known context shapes and keep uncertain access
  defensive with optional chaining.
- Do not submit a full `function` declaration or arrow function. Submit the
  function body only.
- Do not use `rules validate-script` for Custom Scripts. That endpoint validates
  automation rule-step code, not custom script registry entries.
- Treat updates as global behavior changes: there is no script versioning, and
  changing an active script affects all consumers after reload.
- Warn before changing or archiving scripts with nonzero `usageCount`.
- Never use Custom Scripts as a substitute for backend validation or permission
  checks.
- Avoid destructive actions unless explicitly requested.
