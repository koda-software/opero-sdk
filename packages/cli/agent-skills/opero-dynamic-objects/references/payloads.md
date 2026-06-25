# Payloads

Use payload files and pass them with `--body-file`.

Before using any field payload example, fetch the live field-type contract:

```bash
opero --json custom-objects field-types get <type>
```

Examples here show common shapes, but `createSchema`, `updateSchema`,
`optionsSchema`, `defaults`, `examples`, and `notes` from the command decide the
valid payload.

## Create Object Draft

```json
{
  "clientMutationId": "support-ticket-create-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "CREATE",
  "draft": {
    "object": {
      "clientId": "object_ticket",
      "key": "ticket",
      "name": "Ticket",
      "namePlural": "Tickets",
      "kind": "REGULAR",
      "createDefaultForm": true,
      "icon": "ticket",
      "color": "#2563EB",
      "isActive": true,
      "isHidden": false,
      "isSingleton": false,
      "displayLabel": "title",
      "fields": [
        {
          "clientId": "field_title",
          "key": "title",
          "name": "Title",
          "type": "TEXT",
          "isRequired": true,
          "isIndexed": true,
          "position": 0
        }
      ]
    }
  }
}
```

```bash
opero custom-objects schema-drafts create support ticket --body-file draft.json
```

## Add Fields Draft

```json
{
  "clientMutationId": "support-ticket-fields-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "fields": [
      {
        "clientId": "field_priority",
        "key": "priority",
        "name": "Priority",
        "type": "TEXT",
        "isRequired": false,
        "isIndexed": true,
        "position": 10
      }
    ]
  }
}
```

## Add Select Choices Draft

Use `SELECT` or `MULTI_SELECT` for object-schema selection fields. Inline
choices are best when the option list belongs only to this field.

Do not add `optionFilterScriptId` to `options`. Attach option filter scripts to
the View Layout with `scriptBindings` instead.

```json
{
  "clientMutationId": "support-ticket-status-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "fields": [
      {
        "clientId": "field_status",
        "key": "status",
        "name": "Status",
        "type": "SELECT",
        "isRequired": true,
        "isIndexed": true,
        "position": 11,
        "options": {
          "choices": [
            {"key": "open", "label": "Open"},
            {"key": "closed", "label": "Closed"}
          ]
        }
      }
    ]
  }
}
```

## Add Dictionary-Backed Select Draft

Use `dictionaryId` when a dynamic object `SELECT` or `MULTI_SELECT` should reuse
an Opero dictionary. Verify `optionSources` includes `dictionary` and
`optionsSchema` allows `dictionaryId`.

```json
{
  "clientMutationId": "media-title-genre-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "fields": [
      {
        "clientId": "field_genre",
        "key": "genre",
        "name": "Genre",
        "type": "SELECT",
        "isRequired": false,
        "isIndexed": true,
        "position": 12,
        "options": {
          "dictionaryId": "dictionary-id"
        }
      }
    ]
  }
}
```

## Add SQL-Backed Select Draft

Use SQL-backed options only when a saved query is the intended source and the
field contract includes `sql_query`.

```json
{
  "clientMutationId": "support-ticket-category-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "fields": [
      {
        "clientId": "field_category",
        "key": "category",
        "name": "Category",
        "type": "SELECT",
        "isRequired": false,
        "isIndexed": true,
        "position": 13,
        "options": {
          "source": "sql_query",
          "queryId": "saved-query-id",
          "parameters": {},
          "mapping": {
            "value": "{{ row.id }}",
            "label": "{{ row.name }}"
          }
        }
      }
    ]
  }
}
```

## Update Object Metadata Draft

```json
{
  "clientMutationId": "crm-deal-metadata-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "object": {
      "id": "object_id_from_schema",
      "key": "deal",
      "name": "Opportunity",
      "namePlural": "Opportunities",
      "kind": "REGULAR",
      "createDefaultForm": false,
      "displayLabel": "name"
    }
  }
}
```

## Delete Field Draft

```json
{
  "clientMutationId": "crm-deal-delete-field-001",
  "baseSchemaHash": "schema_hash_from_custom_objects_schema",
  "operation": "UPDATE",
  "draft": {
    "deletes": {
      "fieldIds": ["field_id_from_schema"]
    },
    "confirmations": {
      "dropColumns": ["field_id_from_schema"]
    }
  }
}
```

## Apply Draft

```json
{
  "clientMutationId": "support-ticket-apply-001"
}
```

```bash
opero custom-objects schema-drafts apply support ticket <draftId> --body-file apply.json
```

## Create Record

```json
{
  "values": {
    "title": "Cannot access portal",
    "priority": "High"
  }
}
```

```bash
opero custom-records create support ticket --body-file record.json
```

## Delete Object

```json
{
  "clientMutationId": "support-ticket-delete-001",
  "confirmObjectKey": "ticket",
  "confirmDropTable": true
}
```

```bash
opero custom-objects delete support ticket --body-file delete.json
```
