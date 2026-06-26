# Concepts

Workflows model record lifecycles. A workflow defines where work can start,
which stages it can enter, and which transitions move it between stages.

## Main Objects

- `workflow`: named process configuration.
- `definition`: complete design containing targets, stages, transitions, and
  metadata.
- `draft`: editable definition. Drafts are not live until published.
- `publication`: published version snapshot.
- `stage`: a state in the process, such as Draft, Review, Approved, or Closed.
- `transition`: an allowed move from one stage to another.
- `runtime instance`: active lifecycle for one target record.
- `task`: work item created for the current stage.
- `assignment`: member or role responsible for the task.

## Targets

Supported workflow target types:

- `SALES_INVOICE`
- `COST_INVOICE`
- `CONTRACTOR`
- `DYNAMIC_OBJECT_RECORD`

Dynamic object runtime targets require both `moduleKey` and `objectKey` in
addition to the target record id.

## Common Requests

Users may ask to:

- create an approval workflow;
- add a review step;
- make a stage read-only;
- require a comment before rejection;
- assign a stage to a role;
- allow the user to choose the next assignee during a transition;
- publish a draft;
- move a record to the next stage;
- see who has tasks;
- reassign a task.

Map these requests to either definition lifecycle commands, runtime commands, or
task commands. Do not mix them casually.
