# Payloads And Examples

## Create Payload

```json
{
  "key": "active-product-options",
  "name": "Active product options",
  "description": "Only show active products.",
  "type": "OPTION_FILTER",
  "code": "return ctx.target.option.meta?.status === 'ACTIVE';",
  "metadata": {
    "owner": "operations"
  }
}
```

Rules:

- `key` is required, unique in the organization, 2-100 chars, starts with a
  letter or number, and may contain letters, numbers, `_`, `.`, and `-`.
- `name` is required.
- `type` is required.
- `code` is required and must be a function body.
- `description` and `metadata` are optional.

## Update Payload

```json
{
  "description": "Only show active products for the selected category.",
  "code": "return ctx.target.option.meta?.status === 'ACTIVE' && ctx.target.option.meta?.category === ctx.record.values?.category;"
}
```

Only include fields that should change.

## Option Filter

Use case: a city field should only show options matching the selected country.

```js
return ctx.target.option.meta?.countryCode === ctx.record.values?.countryCode;
```

Type:

```text
OPTION_FILTER
```

Attach this script through the View Layout draft `scriptBindings` array:

```json
{
  "id": "binding_filter_city_options",
  "scriptId": "script_id",
  "hook": "optionFilter",
  "target": {
    "blockId": "field_city",
    "fieldKey": "city"
  },
  "enabled": true,
  "priority": 0,
  "config": {}
}
```

Do not put this script id in dynamic object field `options`; the unsupported
`options.optionFilterScriptId` shape is rejected.

## Field Visibility

Use case: show VAT ID only for business customers.

```js
return ctx.record.values?.customerType === 'BUSINESS';
```

Type:

```text
FIELD_VISIBILITY
```

## Field Readonly

Use case: lock an amount after approval.

```js
return ctx.record.workflow?.state === 'approved';
```

Type:

```text
FIELD_READONLY
```

## Field Default

Use case: default currency in create mode.

```js
return ctx.record.values?.customerCurrency ?? 'PLN';
```

Type:

```text
FIELD_DEFAULT
```

## Field Change

Use case: after amount changes, compute a related value, update another form
field, notify the user, or call an integration.

```js
if (ctx.event.value === ctx.event.previousValue) return;

const net = Number(ctx.event.value ?? 0);
const gross = Math.round(net * 1.23 * 100) / 100;
ctx.form?.setValue?.('grossAmount', gross);

await ctx.queries.run('audit_amount_change', {
  previousValue: ctx.event.previousValue,
  value: ctx.event.value
});
```

Type:

```text
FIELD_CHANGE
```

Field-change scripts are async-capable and backend saves them as `ASYNC`. Their
return value is ignored. The UI label is "On field change". They are
field-targeted and non-DOM. They run after the user changes the bound field in
dynamic object create/edit forms and public dynamic forms; they do not run for
view-only fields.

Attach this script through the View Layout draft `scriptBindings` array:

```json
{
  "id": "binding_amount_field_change",
  "scriptId": "script_id",
  "hook": "fieldChange",
  "target": {
    "blockId": "field_amount",
    "fieldKey": "amount"
  },
  "enabled": true,
  "priority": 0,
  "config": {}
}
```

The runtime passes the event data under:

```js
ctx.event.previousValue
ctx.event.value
ctx.event.values
```

## Before Action

Use case: prevent submit while form errors exist.

```js
if (ctx.form?.hasErrors?.()) {
  ctx.notifications?.warning?.('Resolve form issues before continuing.');
  return false;
}
return true;
```

Type:

```text
BEFORE_ACTION
```

## After Action

Use case: show a notification after a successful action.

```js
ctx.notifications?.success?.(
  `Saved ${ctx.event?.result?.displayName ?? 'record'}`
);
```

Type:

```text
AFTER_ACTION
```

## Template Function

Use case: format a number as currency in a template.

```js
const currency = args?.[0] || 'PLN';
return new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency
}).format(Number(value || 0));
```

Type:

```text
TEMPLATE_FUNCTION
```

## Custom Callable Script

Use case: reusable predicate called by another script.

```js
return Number(ctx.event?.input?.amount ?? 0) > 1000;
```

Type:

```text
CUSTOM
```
