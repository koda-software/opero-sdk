# Validation

Custom Script validation happens when a script is created or when `type` or
`code` changes during update. The saved script response includes:

```json
{
  "validationStatus": "VALID",
  "validationErrors": []
}
```

There is no standalone unsaved validation command for Custom Scripts in the
current CLI/API surface.

Important: `opero rules validate-script` validates automation rule `RUN_SCRIPT`
step code. Do not use it to validate Custom Scripts. For rule script context
discovery, use `opero rules context-schemas --body-file <file>` for drafts or
`opero rules context-schema <rule-id> --step-position <n>` for saved rules.

## What Validation Checks

Backend static validation checks:

- Supported script type.
- Code size below the static validation limit.
- ES2022 function-body syntax.
- Banned globals and escape hatches.
- Unknown free identifiers.
- Return statement for types that require returns.
- Static dependency keys for script/query/action helper calls.
- Async/helper compatibility for the script type.

The create/update DTO accepts code up to 32768 characters. Static validation
uses a stricter byte-size limit. A saved script may come back `INVALID`; fix the
reported errors and update it.

## Common Error Codes

- `UNKNOWN_SCRIPT_TYPE`
- `CODE_TOO_LARGE`
- `SYNTAX_ERROR`
- `BANNED_GLOBAL`
- `UNKNOWN_IDENTIFIER`
- `MISSING_RETURN`
- `DYNAMIC_DEPENDENCY_KEY_NOT_ALLOWED`
- `ASYNC_HELPER_NOT_ALLOWED_FOR_HOOK`
- `ASYNC_NOT_ALLOWED_FOR_TEMPLATE_FUNCTION`
- `ASYNC_HELPER_NOT_ALLOWED_FOR_TEMPLATE_FUNCTION`

Errors may include `line` and `column`.

## Allowed And Disallowed Identifiers

Use declared local variables and the runtime parameter `ctx`. Direct unknown
globals are rejected.

Allowed standard globals include common JavaScript constructors/utilities such
as `JSON`, `Math`, `Date`, `String`, `Number`, `Boolean`, `Array`, `Object`,
`RegExp`, `Map`, `Set`, `Promise`, `Error`, `TypeError`, `Intl`, `parseInt`,
`parseFloat`, `isNaN`, and `isFinite`.

Avoid direct browser and escape-hatch globals such as `window`, `document`,
`fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `Function`, timers, browser
storage, IndexedDB, crypto/file/blob APIs, dialogs, dynamic import, and
`__proto__` access.

## Dependency Extraction

The backend extracts dependencies from static helper calls:

```js
await ctx.scripts.run('normalize-amount', input);
await ctx.queries.run('active-products', params);
await ctx.api.call('submit-action', payload);
await ctx.requests.send({ url: 'https://example.com' });
```

For scripts, queries, and actions, the first argument must be a static string.
Dynamic keys are rejected because dependencies cannot be resolved.

The response contains dependency statuses such as resolved, unknown, archived,
invalid, or not callable. Treat unresolved dependencies as a reason to correct
the script before relying on it.

## Save-Time Workflow

1. Create or update with a payload file.
2. Inspect `validationStatus`.
3. If invalid, inspect `validationErrors`.
4. Fix code/type/dependencies.
5. Update the script again.
6. Re-fetch the script and confirm `validationStatus: VALID`.
