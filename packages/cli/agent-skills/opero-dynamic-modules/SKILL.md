---
name: opero-dynamic-modules
description: Use when creating, updating, inspecting, hiding, activating, deleting, or explaining Opero dynamic/custom modules, including module metadata, module schema context, object/field summaries, object-scoped schema routing, and delete impact.
---

# Opero Dynamic Modules

Use this skill for Opero dynamic modules: top-level business areas such as CRM,
Assets, Support, or HR that contain dynamic/custom objects and their fields.

Module changes are metadata changes, such as name, icon, color, active state,
or hidden state. Modules also expose schema context for planning object and
field work, but schema is changed through object-scoped workflows.

## References

Read only the reference needed for the task:

- `references/concepts.md`: what modules are, how they relate to objects,
  fields, records, forms, View Layouts, queries, and scripts.
- `references/metadata.md`: list, inspect, create, update, hide, activate, and
  read module schema context.
- `references/delete-safety.md`: delete impact, destructive schema boundaries,
  and recovery rules.
- `references/payloads.md`: module metadata and delete payload examples.

## Before You Start

Before changing a module:

- Understand which module should change.
- Know whether the user wants module settings or object/field schema changes.
- Read the current module or schema before changing it.
- If anything is being deleted, preview the impact first.
- For object or field changes, route to object-scoped schema commands before
  planning any mutation.

Before saving or applying, summarize:

```text
I will change this module:
- Module: ...
- Change type: metadata/schema/delete
- Changes: ...
- Risk: ...
- I will check current state before applying.
```

Do not create, update, apply, or delete until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless current context already proves auth and API
   reachability.
2. Identify whether the task is module metadata, schema, or deletion.
3. Inspect current state:

   ```bash
   opero --json custom-modules get <moduleKey>
   opero --json custom-modules schema <moduleKey>
   ```

4. For metadata changes, prepare a small body file and use create/update.
5. For object or field schema changes, use object-scoped schema commands such
   as `opero custom-objects schema-drafts ...`.
6. For deletion, run delete impact first:

   ```bash
   opero --json custom-modules delete-impact <moduleKey>
   ```

7. Verify the result with `custom-modules get` or `custom-modules schema`.

## Rules

- Do not use module metadata update for object or field changes. Use
  object-scoped schema workflows for schema changes.
- Do not invent object or field keys. Inspect existing schema and use stable,
  clear keys.
- Treat apply and delete as live changes.
- Do not delete a module unless the user explicitly approved the impact.
- If the request is about one object or its records, prefer
  `opero-dynamic-objects` when installed.
- If the request is about forms or how users see/edit records, prefer
  `opero-dynamic-forms` or `opero-view-layouts` when installed.
