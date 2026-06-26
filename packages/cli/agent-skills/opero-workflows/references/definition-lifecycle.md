# Definition Lifecycle

Workflow definition work changes how future workflow instances behave. It may
also affect live records after publish.

## Commands

```bash
opero --json workflow-templates list
opero workflow-templates create-workflow <templateId> --body-file create.json

opero --json workflows list
opero workflows create --body-file workflow.json
opero --json workflows get <workflowId>
opero workflows update <workflowId> --body-file metadata.json

opero --json workflows draft get <workflowId>
opero workflows draft save <workflowId> --body-file draft.json
opero workflows publish <workflowId> --body-file publish.json
opero workflows discard-draft <workflowId>

opero --json workflows publications list <workflowId>
opero workflows publications create-draft <workflowId> <publicationId>
```

## Safe Edit Flow

1. List or get the workflow.
2. Get the current draft.
3. If there is no usable draft, create one from the current publication when
   appropriate.
4. Edit the complete `definition` object.
5. Save the full draft with `workflows draft save`.
6. Inspect returned validation details and draft state.
7. Publish only when the user approves.
8. Verify with `workflows get` and, if needed, `workflows publications list`.

## Full Draft Replacement

`opero workflows draft save` replaces the editable draft definition. Send the
complete intended `definition`, not only the one stage or transition being
changed.

When editing one part:

- read the current draft;
- preserve unrelated targets, stages, transitions, and metadata;
- keep stable keys for unchanged stages and transitions;
- update only the intended fields.

## Create vs Template

Use templates when the user wants a standard starting point. Use direct create
when the user provides a custom process or when no template matches.

Create workflow requires metadata such as `key`, `name`, and `targets`.
Definition may be provided at create time, but complex definitions should still
be inspected through the draft flow before publishing.
