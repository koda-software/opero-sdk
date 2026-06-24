# Rule Scripts

Use these commands only for automation rule `RUN_SCRIPT` steps. They do not
create, update, validate, or describe Custom Script registry entries.

## Context Discovery

For a new or unsaved rule draft, compute available context schemas from the
draft trigger and steps:

```bash
opero --json rules context-schemas --body-file rule-draft.json
```

The request body should include the draft rule shape the API expects, including
`triggerType` and `steps`. Use this before writing a `RUN_SCRIPT` step in a new
or edited draft, because context depends on the trigger and the preceding
steps.

For an existing saved rule, fetch the context before one step:

```bash
opero --json rules context-schema <rule-id> --step-position 1
```

`--step-position` is the saved rule step position to inspect. Use this before
editing a saved `RUN_SCRIPT` step so the code only references fields available
at that point in the rule.

## Validation

Validate rule `RUN_SCRIPT` code with:

```bash
opero --json rules validate-script --body-file script-request.json
```

This validates rule-step script code. It does not return the context shape; use
`rules context-schemas` or `rules context-schema` for context discovery.

Do not use this command for Custom Scripts. Custom Scripts validate during
`opero custom-scripts create` and `opero custom-scripts update`.

## Practical Workflow

1. For a saved rule, fetch the rule with `opero --json rules get <rule-id>`.
2. Get the context with `opero --json rules context-schema <rule-id>
   --step-position <n>`, or use `rules context-schemas` for a draft.
3. Write the rule script against only the returned context fields.
4. Validate the script with `opero --json rules validate-script --body-file
   script-request.json`.
5. Update the rule with `opero rules update <rule-id> --body-file rule.json`.

## Boundary With Custom Scripts

- Custom Scripts are managed with `opero custom-scripts ...`.
- Rule `RUN_SCRIPT` code is embedded inside automation rules and validated with
  `opero rules validate-script`.
- Rule context schemas are available through `opero rules context-schemas` and
  `opero rules context-schema`.
- Custom Script runtime `ctx` shapes are frontend-owned and are documented in
  `types-and-context.md`; there is no Custom Script-specific context-schema CLI
  command.
