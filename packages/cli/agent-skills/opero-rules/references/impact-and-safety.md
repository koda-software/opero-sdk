# Impact And Safety

Rules can mutate data and call external systems. Treat writes, activation, and
manual execution as live operations.

## Permissions

Rules API permissions are separate from dashboard permissions.

- `api.rules.read`: read builder metadata, rules, related rules, and execution
  history.
- `api.rules.manage`: create, update, delete, and validate rules and rule
  scripts.
- `api.rules.execute`: manually execute active manual rules.

A token may execute a known manual rule without being able to list or inspect
rules if it only has execute permission.

## Side Effects

Warn and ask for approval when a rule may:

- send email;
- call webhooks;
- update records, users, organizations, contractors, or custom fields;
- generate documents or attach files;
- call another rule;
- wait and continue later;
- run AI or scripts with externally visible results.

## Inactive First

Create new side-effect rules with `isActive: false`. Read them back and review
before activation.

Activation is a live change:

```json
{
  "isActive": true
}
```

## Related Rules Before Schema Changes

Before deleting or changing custom modules, custom objects, or custom fields,
inspect related rules:

```bash
opero --json rules related-custom-module <moduleKey>
opero --json rules related-custom-object <moduleKey> <objectKey>
opero --json rules related-custom-field <fieldDefinitionId>
```

If related rules exist, summarize affected rules and ask whether to update,
disable, or leave them unchanged.

## Delete vs Disable

Prefer disabling when the user wants automation to stop but may need to inspect
or restore it later:

```json
{
  "isActive": false
}
```

Delete only when the user explicitly wants the rule removed.

## Common API Errors

- `400`: invalid body, invalid trigger/step config, invalid branching, reserved
  context key, invalid script, or too-large execution data.
- `403`: token lacks Rules API permission.
- `404`: Rules module disabled, missing rule, missing execution, or manual
  execution target is inactive/not manual.
