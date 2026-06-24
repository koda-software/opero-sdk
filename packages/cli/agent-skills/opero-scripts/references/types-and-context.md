# Types And Context

Custom Script code is stored as a JavaScript function body. Most script types
receive one parameter:

```text
ctx
```

`TEMPLATE_FUNCTION` uses:

```text
ctx, value, args, context, orgId, filter
```

Do not submit a full `function` declaration or arrow function. Submit only the
body that belongs inside the generated function.

## Script Types

| Type | Hook | Return | Async | Typical use |
| --- | --- | --- | --- | --- |
| `OPTION_FILTER` | `optionFilter` | `boolean` | sync only | Include or exclude one select option. |
| `FIELD_VISIBILITY` | `fieldVisibility` | `boolean` | sync only | Show or hide a field. |
| `FIELD_READONLY` | `fieldReadonly` | `boolean` | sync only | Make a field readonly. |
| `FIELD_DEFAULT` | `fieldDefault` | any value | sync only in v1 | Provide a default value in create mode. |
| `BEFORE_ACTION` | `beforeAction` | `boolean` or `undefined` | async allowed | Run before a UI action; `false` can cancel. |
| `AFTER_ACTION` | `afterAction` | ignored | async allowed | Run after a UI action. |
| `ON_RENDER` | `onRender`, `onBlockRender` | ignored | sync only in v1 | Run after a surface or block renders. |
| `TEMPLATE_FUNCTION` | `templateFunction` | any value | sync only | Liquid/template helper function. |
| `CUSTOM` | `custom` | any value | caller inherited | Reusable callable script for other scripts. |

## Helper Availability

Known runtime helper families:

- `ctx.scripts.run('script-key', ...)`
- `ctx.queries.run('query-key', ...)`
- `ctx.api.call('action-key', ...)`
- `ctx.requests.send(...)`

Only static string dependency keys are accepted for `ctx.scripts.run`,
`ctx.queries.run`, and `ctx.api.call`. Dynamic dependency keys are rejected.

Async helpers are only allowed where async is allowed. `TEMPLATE_FUNCTION`
cannot use async syntax or helper calls. In v1, hooks marked sync-only cannot
use `ctx.requests.send`.

## Common Context Shape

The live `ctx` object is frontend-owned. Use these shapes as guidance, not as a
complete guarantee. Keep access defensive with optional chaining when unsure.

Common roots:

```js
ctx.binding
ctx.event
ctx.hook
ctx.record
ctx.target
ctx.user
```

Common record fields:

```js
ctx.record.id
ctx.record.values
ctx.record.customFields
ctx.record.workflow
```

Common target fields:

```js
ctx.target.block
ctx.target.field
ctx.target.action
ctx.target.option
ctx.target.region
```

`OPTION_FILTER` gets option information under:

```js
ctx.target.option.id
ctx.target.option.label
ctx.target.option.meta
ctx.target.option.value
```

Action scripts may use:

```js
ctx.target.action
ctx.event.result
```

Template functions receive values directly:

```js
value
args
context
orgId
filter
```

## Return Semantics

- `OPTION_FILTER`, `FIELD_VISIBILITY`, and `FIELD_READONLY` must return a
  boolean.
- `FIELD_DEFAULT` should return the default value.
- `BEFORE_ACTION` may return `false` to cancel. `true` or `undefined` continues.
- `AFTER_ACTION`, `ON_RENDER`, and `onBlockRender` ignore return values.
- `TEMPLATE_FUNCTION` must return a value.
- `CUSTOM` depends on the caller.
