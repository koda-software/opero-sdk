# Runtime

Runtime commands work with active workflow instances for records. They do not
change workflow definitions.

## Commands

```bash
opero --json workflows runtime create-options --target-type <type>
opero --json workflows runtime target-state <targetId> --target-type <type>
opero workflows runtime start <targetId> --target-type <type> --body-file start.json
opero --json workflows runtime get <instanceId>
opero --json workflows runtime replay <instanceId>
opero workflows runtime update-author <instanceId> --body-file author.json
opero workflows runtime execute-transition <instanceId> <transitionId> --body-file transition.json
opero --json workflows runtime history <instanceId>
```

For dynamic object records:

```bash
opero --json workflows runtime target-state <recordId> \
  --target-type DYNAMIC_OBJECT_RECORD \
  --module-key <moduleKey> \
  --object-key <objectKey>
```

## Runtime Flow

1. Read create options or target state.
2. If no active instance exists and the user wants one, start the selected
   workflow.
3. Read the instance to see current stage, available transitions, assignment
   requirements, permissions, and current task.
4. Execute only an available transition.
5. If the transition requires selected assignment, use the assignment details
   from the runtime response and provide `assignee` or `assignees`.
6. Re-read the instance or history to verify the new stage.

## Transition Execution

Transition execution payload may include:

- `comment`: required when the transition has `requiredComment: true`;
- `payload`: optional integration-specific data;
- `assignee`: selected next assignee for single-assignee stages;
- `assignees`: selected next assignees for multiple-assignee stages.

Do not execute a transition by key unless the CLI/API endpoint accepts that key.
The runtime execute command uses transition ID.

## Safety

- A target can have only one active workflow instance at a time.
- Transition conditions still apply to external API calls.
- Restricted transitions may require runtime override permission.
- Stage read-only/edit restrictions for record mutation are handled separately.
