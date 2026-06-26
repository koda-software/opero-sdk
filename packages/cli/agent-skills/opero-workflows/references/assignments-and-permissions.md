# Assignments And Permissions

Assignments decide who owns workflow tasks. Permissions decide who can manage
workflows, execute transitions, and edit records while workflow stages are
active.

## Stage Assignment

Stage `assignmentConfig` can include:

- `assignmentMode`: `single` or `multiple`;
- `assignee`: one member or role;
- `assignees`: non-empty list for multiple-assignee stages;
- `reassignmentCandidates`: valid members/roles for reassignment.

Assignee shape:

```json
{ "type": "membership", "id": "membership_id" }
```

```json
{ "type": "role", "id": "role_id" }
```

## Transition Assignment

Transition `assignmentConfig` supports:

- fixed assignment: `{ "mode": "fixed", "assignee": ... }` or
  `{ "mode": "fixed", "assignees": [...] }`;
- selected assignment: `{ "mode": "select", "candidates": ... }`.

For `select`, the runtime transition response tells the caller that an assignee
must be selected. Use `assignee` for single target stages, or `assignees` for
multiple target stages.

## Candidate Lookup

Use candidate lookup before choosing members or roles when valid choices are not
known:

```bash
opero --json workflows assignment-candidates lookup \
  --source-type stage \
  --source-id <stageId> \
  --candidate-type membership \
  --search "Ada" \
  --limit 10
```

Use `--source-type transition` for transition assignment selection.

## Edit Access

Stage `editAccessConfig` controls record editing while a record is in that
stage:

- `everyone`: normal editors can edit;
- `assignee_and_overrides`: current assignee plus override editors can edit;
- `overrides_only`: only override editors can edit.

Override editors can include `membershipIds` and `roleIds`.

## API Token Permissions

Relevant API permissions:

- `api.workflows.read`
- `api.workflows.manage`
- `api.workflows.publish`
- `api.workflows.runtime.read`
- `api.workflows.runtime.execute`
- `api.workflows.runtime.override`
- `api.workflows.tasks.read`
- `api.workflows.tasks.manage`
- `api.workflows.bypassMutationGuard`

Runtime override is for trusted integrations executing transitions that normal
user/role checks would block. Mutation guard bypass is separate and applies to
record writes blocked by workflow stage edit restrictions.
