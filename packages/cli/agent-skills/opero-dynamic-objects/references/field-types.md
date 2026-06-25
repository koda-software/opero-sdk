# Field Types

Dynamic object fields define stored record data. Always discover current object
schema and the exact field-type contract before adding or changing fields:

```bash
opero --json custom-objects schema <moduleKey> <objectKey>
opero --json custom-objects field-types get <type>
```

Treat `custom-objects field-types get <type>` as the source of truth for field
payload shape. Use `createSchema`, `updateSchema`, `optionsSchema`,
`valueSchema`, `defaults`, `examples`, and `notes`; do not infer `options` from
a similar field or stale generated OpenAPI types.

## Supported Types

```text
TEXT, TEXTAREA, CUSTOM_HTML, HTML_SECTION, NUMBER, DECIMAL, CURRENCY, BOOLEAN,
DATE, DATETIME, SELECT, MULTI_SELECT, REFERENCE, FILE, FILES, USER, USER_MULTI,
CONTRACTOR, CONTRACTOR_MULTI, EMAIL, PHONE, URL, SUBORDINATE_OBJECT_REFERENCE
```

All fields use:

- `key`
- `name`
- `type`
- `isRequired`
- `isIndexed`
- `defaultValue`
- `position`
- `options`

## Selection Fields

Use `SELECT` for one selected value and `MULTI_SELECT` for many selected values.

Dynamic object `SELECT` and `MULTI_SELECT` field contracts report
`optionSources` including at least:

Inline choices:

```json
{
  "choices": [
    {"key": "open", "label": "Open"},
    {"key": "closed", "label": "Closed"}
  ]
}
```

Dictionary source:

```json
{
  "dictionaryId": "dictionary-id"
}
```

SQL source:

```json
{
  "source": "sql_query",
  "queryId": "saved-query-id",
  "parameters": {},
  "mapping": {
    "value": "{{ row.id }}",
    "label": "{{ row.name }}"
  }
}
```

Use this decision rule:

- Use inline `choices` when the option list belongs only to this object field.
- Use `dictionaryId` when the field should reuse an Opero dictionary. Discover
  the dictionary id with `opero --json dictionaries list` and inspect entries
  with `opero --json dictionaries entries <dictionaryId>`.
- Use `source: "sql_query"` when options must be computed from a saved query.
- Use the View Layout custom field workflow only when the user is asking for a
  layout/form custom field definition instead of a stored dynamic object schema
  field.

Always confirm the live `optionsSchema` before applying a schema draft.

Do not put option-filter scripts in dynamic field `options`. Dynamic object
field schema no longer supports `options.optionFilterScriptId`; new writes and
schema drafts reject it, and responses scrub legacy stored values. Use View
Layout `scriptBindings` with `hook: "optionFilter"` for option filtering.

## Reference And Subordinate Fields

Use `REFERENCE` to link records to another dynamic object:

```json
{
  "toObjectId": "object-id"
}
```

or:

```json
{
  "toModuleKey": "crm",
  "toObjectKey": "company",
  "cardinality": "ONE_TO_ONE"
}
```

Use `SUBORDINATE_OBJECT_REFERENCE` for parent-to-child row relationships. This
often needs View Layout relation-table work after schema apply.

For `CURRENCY`, expect the field contract to require options such as
`currencyKey`. For all other field types, fetch the contract first and follow
its `optionsSchema` and examples.

## File And HTML Fields

`FILE` stores one file id. `FILES` stores an array of file ids. Upload files
through file commands first, then store returned ids.

`CUSTOM_HTML` stores `{ "html": "...", "css": "..." }` values.
`HTML_SECTION` is read-only form content and stores HTML config in `options`.

## User, Contractor, And Scalar Fields

`USER`, `USER_MULTI`, `CONTRACTOR`, and `CONTRACTOR_MULTI` store ids. Multi
types store arrays.

`TEXT`, `TEXTAREA`, `EMAIL`, `PHONE`, and `URL` store strings. `NUMBER` stores
integers. `DECIMAL` and `CURRENCY` store decimal numbers. `BOOLEAN`, `DATE`,
and `DATETIME` store their corresponding scalar values.
