# Rules Concepts

Rules automate organization work. A rule can start from an event or from manual
execution, then run ordered steps.

## Shape

A saved rule has:

- `name`, `category`, optional `description`, `isActive`, and `scope`;
- optional `trigger`;
- ordered `steps`.

External API-managed rules are organization-scoped. If `scope` is omitted, the
API saves the rule as `ORGANIZATION`.

## Triggers

The trigger decides when the rule starts.

Common trigger categories include:

- record changes such as `RECORD_CREATED`, `RECORD_UPDATED`, `FIELD_CHANGED`,
  and `RECORD_DELETED`;
- user, organization, contractor, invoice, attachment, and workflow events;
- `CRON`;
- `MANUAL`.

Some triggers require an `objectId`, especially dynamic/custom record triggers.
Use `opero --json rules config` to check which triggers require an object and
what their config shape expects.

## Steps

Steps run by numeric `position`. A step has:

- `type`;
- `position`;
- type-specific `config`;
- optional display `name`;
- optional `contextKey`;
- optional `onSuccess` and `onFailure`.

Available step types include:

- `FETCH_QUERY`
- `RUN_SCRIPT`
- `CONDITION`
- `UPDATE_RECORD`
- `CREATE_RECORD`
- `GENERATE_DOCUMENT`
- `GET_ATTACHMENTS`
- `ATTACH_FILE`
- `SEND_EMAIL`
- `CALL_WEBHOOK`
- `AI`
- `CALL_RULE`
- `UPDATE_USER`
- `UPDATE_ORGANIZATION`
- `UPDATE_CONTRACTOR`
- `UPDATE_CUSTOM_FIELD`
- `TOGGLE_CUSTOM_FIELD`
- `LOG_OUTPUT`
- `SAVE_TO_CONTEXT`
- `WAIT`

Do not assume the config shape for a step type. Use `rules step-types` and the
returned `configSchema`.

## Context

The base context usually includes `trigger` and `organization`.

If a step has `contextKey`, its output becomes available to later steps under
that key. For example, a query step with `contextKey: "rows"` can make
`context.rows` available to later script or template steps.

Do not use these reserved context keys:

- `trigger`
- `organization`
- `__depth`
- `__ruleLineage`
- `__error`
- `__skip`

## Branching

`onFailure` can be:

- `stop`
- `goto:N`

If `onFailure` uses `goto:N`, a step with position `N` must exist. Keep
positions easy to inspect and branch targets obvious.

## Rules vs Workflows

Use rules for event/manual automation and ordered side effects.

Use workflows for long-running state, stages, transition buttons, tasks,
assignees, and workflow history.
