# Concepts

A dynamic module is a top-level business area that groups dynamic/custom
objects. Examples include CRM, Assets, Support, or HR.

Modules have two kinds of change:

- Metadata changes: name, description, icon, color, active/hidden state.
- Schema context: objects, fields, references, record counts, and current
  schema hashes.

Use module metadata commands for metadata. Use module schema context to inspect
the module before planning object or field work. Change object and field schema
through object-scoped workflows.

## Relationship To Other Opero Features

- Dynamic objects live inside modules.
- Fields belong to objects, not directly to modules.
- Records are instances of objects.
- Forms decide how object records are created, viewed, or edited.
- View Layouts decide which fields and blocks appear on forms/screens.
- Saved queries can read module/object tables through schema-discovered
  `runtime_dyn` tables.
- Scripts and workflows can depend on module/object fields, so schema changes
  can affect automation.

Example hierarchy:

```text
Module: CRM
├─ Object: Company
│  ├─ Fields: name, website, industry, owner
│  ├─ Records: Acme Ltd, Koda Soft, ...
│  ├─ Forms
│  │  ├─ Create company form
│  │  ├─ Edit company form
│  │  └─ Company details form
│  └─ View Layouts
│     ├─ Company create layout
│     ├─ Company edit layout
│     └─ Company details layout
├─ Object: Contact
│  ├─ Fields: first_name, last_name, email, company
│  ├─ Records: individual contact rows
│  ├─ Forms: create, edit, details
│  └─ View Layouts: layouts that place contact fields and blocks on each form
└─ Object: Deal
   ├─ Fields: name, value, stage, company, owner
   ├─ Records: sales opportunities
   ├─ Forms: create, edit, details
   └─ View Layouts: layouts for how deal forms/screens are assembled
```

The module groups the business area. Objects define the data types inside it.
Fields define each object's data shape. Records are the saved data. Forms define
the user intent or mode, and View Layouts define what appears on those forms.

## Schema Context

Use schema context before planning schema work:

```bash
opero --json custom-modules schema <moduleKey>
```

The response includes:

- module metadata;
- objects;
- fields;
- incoming and outgoing references;
- record counts;
- `schemaHash`.

Use this response to understand what exists. Do not mutate schema from module
scope. For fields, relationships, object setup, or destructive object changes,
use object-scoped commands.

## Typical Requests

- Create a module.
- Rename or hide a module.
- Inspect objects and fields in a module.
- Inspect all objects and fields in a module.
- Check what deleting a module would affect.
