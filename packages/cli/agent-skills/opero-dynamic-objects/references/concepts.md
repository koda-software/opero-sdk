# Concepts

A dynamic object is a business record type inside a dynamic module. In a CRM
module, typical objects might be Company, Contact, and Deal.

Objects contain fields. Records are saved rows for that object. Relationships
are fields that connect records across objects. Forms decide create/view/edit
intent. View Layouts decide what fields and blocks users see on those forms.

## Object Shape

Objects commonly include:

- `key`: stable command/API identifier, such as `company`.
- `name` and `namePlural`: labels shown to users.
- `kind`: `REGULAR` or `SUBORDINATE`.
- `isSingleton`: true when the object has one record rather than a list.
- `displayLabel`: field used as the record label.
- `icon`, `color`, `isActive`, `isHidden`.
- fields, incoming references, outgoing references, and record count.

## Fields

Fields describe the data stored on records. Supported field types include:

```text
TEXT, TEXTAREA, CUSTOM_HTML, HTML_SECTION, NUMBER, DECIMAL, CURRENCY, BOOLEAN,
DATE, DATETIME, SELECT, MULTI_SELECT, REFERENCE, FILE, FILES, USER, USER_MULTI,
CONTRACTOR, CONTRACTOR_MULTI, EMAIL, PHONE, URL, SUBORDINATE_OBJECT_REFERENCE
```

Field properties include `key`, `name`, `type`, `isRequired`, `isIndexed`,
`defaultValue`, `position`, and type-specific `options`.

For field-specific config, read `references/field-types.md`. Do not guess
`options` shape from the field type name.

## Relationship To Other Opero Features

```text
Module: CRM
└─ Object: Deal
   ├─ Fields
   │  ├─ name: TEXT
   │  ├─ value: CURRENCY
   │  ├─ stage: SELECT
   │  ├─ company: REFERENCE -> Company
   │  └─ line_items: SUBORDINATE_OBJECT_REFERENCE -> Deal Line Item
   ├─ Records: saved deals
   ├─ Forms: create, edit, view/detail contracts
   ├─ View Layouts: arrangement of fields and blocks on each form
   ├─ Queries: can read this object through discovered `runtime_dyn` tables
   └─ Scripts/Workflows: can read or change records and may depend on fields
```

Object schema changes can affect records, forms, View Layouts, queries,
scripts, workflows, integrations, and delete impact. Inspect before changing.

## Typical Requests

- Create a Ticket object in Support.
- Add a priority field to Ticket.
- Rename a field or make it required.
- Link Contact records to Company records.
- Add line items as child rows under Deal.
- List or update records.
- Check whether an object can be deleted.
