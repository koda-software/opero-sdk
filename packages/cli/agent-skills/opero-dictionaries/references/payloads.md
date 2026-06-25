# Payloads

Use payload files and pass them with `--body-file`.

## Create Dictionary

```json
{
  "clientMutationId": "payment-methods-create-001",
  "key": "payment-methods",
  "name": "Payment Methods",
  "description": "Available payment methods for invoices",
  "entryKeyMode": "CUSTOM",
  "entryMetadataSchema": [
    {
      "key": "externalCode",
      "type": "STRING",
      "required": false
    }
  ],
  "entries": [
    {
      "clientRowId": "row-card",
      "key": "card",
      "value": "Card",
      "translations": {
        "pl": "Karta"
      },
      "isActive": true,
      "metadata": {
        "externalCode": "CARD"
      }
    }
  ]
}
```

```bash
opero dictionaries create --body-file dictionary.json
```

## Update Metadata Only

Omit `entries` when entries should stay unchanged:

```json
{
  "clientMutationId": "payment-methods-update-001",
  "name": "Payment Methods",
  "description": "Payment options available on invoices"
}
```

```bash
opero dictionaries update <id> --body-file dictionary-update.json
```

## Replace Full Entry Set

Use this only after reading the current dictionary and confirming replacement:

```json
{
  "clientMutationId": "payment-methods-replace-001",
  "entries": {
    "mode": "replace",
    "items": [
      {
        "id": "existing_entry_id",
        "key": "card",
        "value": "Card",
        "translations": {
          "pl": "Karta"
        },
        "isActive": true,
        "metadata": {
          "externalCode": "CARD"
        }
      },
      {
        "clientRowId": "row-bank-transfer",
        "key": "bank-transfer",
        "value": "Bank transfer",
        "isActive": true,
        "metadata": {
          "externalCode": "WIRE"
        }
      }
    ]
  }
}
```

## Deactivate Entry

Keep the entry in the replacement set and set `isActive: false`:

```json
{
  "clientMutationId": "payment-methods-deactivate-001",
  "entries": {
    "mode": "replace",
    "items": [
      {
        "id": "existing_entry_id",
        "key": "cash",
        "value": "Cash",
        "isActive": false,
        "metadata": {}
      }
    ]
  }
}
```

Include all entries that should remain when using replacement.

## Import Entries

```bash
opero dictionaries entries import <dictionaryId> --file entries.json --strategy MERGE
opero dictionaries entries import <dictionaryId> --file entries.csv --strategy REPLACE
```

## Export Entries

```bash
opero dictionaries entries export <dictionaryId> --format json --out entries.json
opero dictionaries entries export <dictionaryId> --format csv --out entries.csv
```
