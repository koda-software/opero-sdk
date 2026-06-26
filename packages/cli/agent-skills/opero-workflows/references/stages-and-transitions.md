# Stages And Transitions

Stages and transitions are the core of a workflow definition.

## Stage Shape

Important stage properties:

- `key`: stable lowercase key. Preserve it for existing stages.
- `name`: user-facing stage name.
- `taskName`: task title used when this stage creates a task.
- `description`: explanation for admins/users.
- `category`: one of `DRAFT`, `ACTIVE`, `WAITING`, `APPROVED`, `REJECTED`,
  `TERMINAL`, `ARCHIVED`.
- `color` and `icon`: presentation.
- `position`: ordering.
- `isInitial`: marks the starting stage.
- `isTerminal`: marks a final stage.
- `isReadOnly`: blocks normal editing while records are in this stage.
- `assignmentConfig`: who owns work in this stage.
- `slaConfig`: due-date behavior.
- `editAccessConfig`: who may edit records in this stage.
- `uiConfig`: builder/display metadata.
- `parameters`: workflow variables available to related runtime features.

A practical workflow normally has exactly one initial stage and at least one
terminal stage.

## Transition Shape

Important transition properties:

- `key`: stable lowercase key. Preserve it for existing transitions.
- `name`: user-facing action label.
- `fromStageKey`: source stage key.
- `toStageKey`: target stage key.
- `position`: ordering among transitions from the same stage.
- `buttonStyle`: presentation for the transition action.
- `requiredComment`: require a comment when executing.
- `permissionConfig`: who may execute the transition.
- `conditionConfig`: runtime conditions.
- `requiredFieldsConfig`: fields that must be filled before transition.
- `assignmentConfig`: how next-stage assignment is resolved.
- `eventConfig`: transition side effects/events when supported.

## Editing Rules

- Do not change keys just to rename a stage or transition.
- If removing or renaming a stage, inspect transitions that reference it.
- If changing `isInitial` or `isTerminal`, check the whole lifecycle.
- If setting `isReadOnly`, explain that record editing may be blocked in that
  stage.
- If adding `requiredComment`, transition execution payloads should include
  `comment`.
- If adding required fields or conditions, verify the required data exists on
  the target record type.
