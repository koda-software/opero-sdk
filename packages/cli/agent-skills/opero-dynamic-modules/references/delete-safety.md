# Delete Safety

Module deletion can affect data, layouts, rules, queries, scripts, forms, and
integrations.

## Preview Module Delete Impact

Always inspect impact first:

```bash
opero --json custom-modules delete-impact <moduleKey>
```

Review affected objects, records, rules, custom fields, references, and related
counts with the user before deleting.

## Delete Module

```bash
opero custom-modules delete <moduleKey>
```

The CLI sends `confirmModuleKey` as a query value. The API requires the
confirmation to match the path module key.

Do not delete a module unless the user explicitly approved deleting that module
after seeing or acknowledging impact.

## Destructive Schema Boundary

Do not perform schema mutation from module scope. Object-scoped schema changes
may require confirmations for:

- deleting fields;
- dropping columns;
- clearing stored field values;
- changing field storage/type in a way that loses values.

Do not include confirmations unless the user accepted the data impact.

## Safer Alternatives

If the user wants something to disappear from normal use, consider:

- hide the module with `isHidden`;
- deactivate it with `isActive: false`;
- hide fields from forms through View Layouts;
- remove a form or default instead of deleting schema.

Deletion should be reserved for explicit data model removal.

## Recovery

Before risky changes:

1. Read current module schema.
2. Keep the planned payload and delete impact response.
3. Prefer object-scoped validated drafts over direct destructive changes.
4. If object-scoped apply fails, inspect draft status and error details before
   retrying.
