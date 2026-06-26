# Context And Rule Scripts

Rule context depends on the trigger and earlier steps. Do not invent context
paths.

## Unsaved Draft Context

For a new or unsaved rule draft, compute context schemas without saving:

```bash
opero --json rules context-schemas --body-file draft.json
```

The body includes `triggerType` and ordered `steps`:

```json
{
  "triggerType": "MANUAL",
  "steps": [
    {
      "type": "FETCH_QUERY",
      "position": 0,
      "contextKey": "rows",
      "config": {
        "queryId": "saved-query-id"
      }
    },
    {
      "type": "RUN_SCRIPT",
      "position": 1,
      "contextKey": "message"
    }
  ]
}
```

The context for a step is the context before that step starts. A `contextKey`
from step 0 is available to step 1 and later, not to step 0 itself.

## Saved Rule Context

For an existing saved rule, inspect context before one step:

```bash
opero --json rules context-schema <ruleId> --step-position <n>
```

Use this before editing a saved `RUN_SCRIPT`, condition, template, or update
step that references previous step output.

## RUN_SCRIPT Steps

`RUN_SCRIPT` code lives inside a rule step. It is not a Custom Script registry
entry.

Validate rule script code with:

```bash
opero --json rules validate-script --body-file script.json
```

Payload:

```json
{
  "code": "return context.trigger.data.amount > 10000;"
}
```

Validation checks script syntax/safety. It does not prove every runtime value
will exist. Use context schemas and defensive access for optional values.

## Boundary With Custom Scripts

- Rule `RUN_SCRIPT` code is embedded in automation rules.
- Rule scripts use `opero rules validate-script`.
- Rule context comes from `opero rules context-schemas` or `opero rules
  context-schema`.
- Custom Scripts are managed with `opero custom-scripts ...` and validate during
  custom script create/update.

Use `opero-scripts` for detailed script authoring patterns, but keep rule
trigger/step/context work in this skill.
