# Concepts

A dictionary is a reusable list of options. Each entry has a stable key and a
display value.

Examples:

```text
Dictionary: payment-methods
├─ Entry: card -> Card
├─ Entry: cash -> Cash
└─ Entry: bank-transfer -> Bank transfer
```

Dictionaries are used by forms, fields, service catalog items, contractors,
records, queries, scripts, and integrations whenever a stable option value is
needed.

Dynamic object schema `SELECT` and `MULTI_SELECT` fields can reuse dictionaries
with object field `options.dictionaryId`, or use inline choices/SQL-backed
options. View Layout custom field definitions can also expose dictionary-backed
config. If the user asks for a dictionary-backed field, decide whether they mean
a stored object schema field or a form/layout custom field before writing
payloads. For stored dynamic object fields, verify the live field contract with
`opero --json custom-objects field-types get SELECT` or
`opero --json custom-objects field-types get MULTI_SELECT`.

## Dictionary Fields

Dictionary details include:

- `id`: API identifier used by commands.
- `key`: stable dictionary key.
- `name` and `description`.
- `scope`: `SYSTEM` or `ORGANIZATION`.
- `entryKeyMode`.
- `entryMetadataSchema`.
- entries.

## Entry Fields

Entries include:

- `id`: entry identifier.
- `key`: stable value used by APIs and stored references.
- `value`: display value.
- `translations`: locale-specific labels.
- `isActive`: whether the entry is available for new selections.
- `position`: display/order position.
- `metadata`: scalar key-value data for the entry.

## Entry Key Modes

- `CUSTOM`: caller provides each entry key.
- `VALUE_KEBAB`: API derives keys from entry values.
- `AUTO_INCREMENT`: API assigns the next numeric key.

Use `CUSTOM` when integrations need stable, meaningful keys. Be cautious when
changing key mode because existing entry keys may be rewritten when possible.

## Metadata Schema

`entryMetadataSchema` defines metadata keys allowed on entries:

- `key`: metadata key.
- `type`: `STRING`, `NUMBER`, or `BOOLEAN`.
- `required`: whether every entry must provide a non-null value.

When the schema is empty, arbitrary scalar metadata is accepted.
