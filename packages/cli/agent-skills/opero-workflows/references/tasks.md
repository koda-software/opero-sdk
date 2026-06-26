# Tasks

Workflow tasks are work-queue items created by active workflow instances.

## Commands

```bash
opero --json workflows tasks list
opero --json workflows tasks get <taskId>
opero workflows tasks reassign <taskId> --body-file reassign.json
```

Task list supports normal list flags:

```bash
opero --json workflows tasks list --limit 50 --filter-json '<json>' --sort-json '<json>'
```

## Task Data

Tasks include:

- workflow and workflow instance IDs;
- current stage;
- target record;
- status: `OPEN`, `COMPLETED`, or `CANCELLED`;
- title;
- assignee or assignees;
- due date;
- opened, completed, cancelled, created, and updated timestamps.

## Reassignment

Use candidate lookup before reassigning if the valid members or roles are not
known.

Single-assignee payload:

```json
{
  "assignee": { "type": "membership", "id": "membership_id" }
}
```

Multiple-assignee payload:

```json
{
  "assignees": [
    { "type": "role", "id": "role_id" }
  ]
}
```

Reassignment updates the open task and the related workflow instance assignment,
and the change appears in workflow history.

## My Work

My Work is the user-facing queue for tasks assigned directly to a member or to
one of their roles. My Work does not complete transitions from the list. Users
open the related record and execute available workflow transitions there.
