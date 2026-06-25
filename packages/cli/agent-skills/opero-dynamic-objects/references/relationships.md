# Relationships

Relationships connect records across objects and influence records, forms,
layouts, queries, scripts, workflows, and delete safety.

## Reference Fields

A `REFERENCE` field links one record to another object. Use it when the child
record should point to an independent parent record, such as:

```text
Contact.company -> Company
Deal.company -> Company
Ticket.requester -> Contact
```

Reference fields usually need type-specific `options` describing the target
module/object. Inspect existing reference fields before creating a new one and
match the API's schema shape.

## Subordinate Objects

A `SUBORDINATE` object represents child rows owned by a parent flow, such as
invoice lines, checklist items, or deal line items.

A `SUBORDINATE_OBJECT_REFERENCE` field connects the parent object to the
subordinate object. Subordinate saves are often handled through View Layout
runtime relation-table workflows, not plain top-level record editing.

## Planning Relationship Changes

Before adding or changing relationships:

- Identify source object and target object.
- Decide whether the relationship is a normal reference or subordinate child
  rows.
- Inspect both objects' schema.
- Check whether forms and View Layouts need to show or edit the relationship.
- Check whether saved queries, scripts, rules, or workflow conditions depend on
  the existing field.

When the user's request is mostly visual, route to `opero-view-layouts`. When
the request changes what data is stored, use object schema drafts first.
