---
name: opero-workflows
description: Use when creating, editing, publishing, explaining, running, troubleshooting, or inspecting Opero workflows, including workflow definitions, drafts, publications, stages, transitions, assignment rules, runtime instances, workflow tasks, candidate lookup, permissions, and target workflow state.
---

# Opero Workflows

Use this skill for Opero workflows: configurable processes that move records
through stages by executing transitions. Workflows can create tasks, assign work
to members or roles, restrict editing while a record is in a stage, and expose
runtime state for records.

Prefer the curated `opero workflows ...` and `opero workflow-templates ...`
commands. Use raw requests only when the installed CLI is older than the
workflow endpoint surface.

## References

Read only the reference needed for the task:

- `references/concepts.md`: workflow model, definitions, drafts,
  publications, runtime instances, tasks, targets, and common user requests.
- `references/definition-lifecycle.md`: list, create, update, draft save,
  publish, discard, publications, restore from publication, and templates.
- `references/stages-and-transitions.md`: stage and transition shape, stable
  keys, initial/terminal stages, read-only stages, conditions, comments,
  required fields, events, and UI metadata.
- `references/assignments-and-permissions.md`: stage assignment, transition
  assignment, assignment candidate lookup, edit access, API token permissions,
  overrides, and mutation guards.
- `references/runtime.md`: create options, target state, starting instances,
  executing transitions, updating author, replay, history, and dynamic object
  target requirements.
- `references/tasks.md`: workflow task list/get/reassign, task status,
  assignees, due dates, and My Work behavior.
- `references/payloads.md`: compact JSON examples for workflow create, draft
  save, publish, transition execution, task reassignment, and candidate lookup.

## Before You Start

Before changing a workflow:

- Know what kind of record the workflow should run on.
- Know the steps the work should move through.
- Know who should handle each step.
- Know which moves between steps should be allowed.
- Know whether comments, required fields, approvals, due dates, or edit locks
  are needed.
- Read the existing workflow or draft before editing.
- Know whether the user wants a draft only or wants it published.

Before creating, saving, publishing, executing, or reassigning, summarize:

```text
I will change this workflow:
- Runs on: ...
- Stages: ...
- Transitions: ...
- Assignment/edit rules: ...
- Draft only or publish: ...
- Runtime/task impact: ...
```

Do not create, save, publish, execute transitions, reassign tasks, discard
drafts, or restore publications until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless current context already proves auth and API
   reachability.
2. Identify whether the task is definition work, runtime work, task work, or an
   explanation.
3. For definition work, inspect current workflows and drafts first:

   ```bash
   opero --json workflows list
   opero --json workflows get <workflowId>
   opero --json workflows draft get <workflowId>
   ```

4. Build a full draft definition from the user intent and the current draft.
   Draft save replaces the whole editable definition.
5. Save the draft with a body file:

   ```bash
   opero workflows draft save <workflowId> --body-file draft.json
   ```

6. Publish only after the saved draft is understood and approved:

   ```bash
   opero workflows publish <workflowId> --body-file publish.json
   ```

7. For runtime work, inspect target state or the instance before changing it:

   ```bash
   opero --json workflows runtime target-state <targetId> --target-type <type>
   opero --json workflows runtime get <instanceId>
   ```

8. Verify every write with a follow-up read.

## Rules

- Treat workflow draft save as replace-list/full-definition style.
- Preserve existing stage and transition keys when editing existing workflows.
- Do not invent member IDs, role IDs, workflow IDs, stage IDs, transition IDs,
  task IDs, module keys, object keys, or target record IDs.
- Use assignment candidate lookup before selecting or reassigning members or
  roles when the valid choices are not already known.
- For `DYNAMIC_OBJECT_RECORD` runtime targets, always include `--module-key`
  and `--object-key`.
- Treat publish, transition execution, task reassignment, author update, draft
  discard, and publication restore as live changes.
- Restricted transitions may require workflow runtime override permission.
- Record edit restrictions are separate from transition execution; API record
  mutations may need workflow mutation-guard bypass permission.
- Do not use workflow runtime commands to change workflow definitions.
