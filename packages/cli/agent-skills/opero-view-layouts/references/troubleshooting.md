# Troubleshooting

Most View Layout failures come from missing permissions, wrong target context,
invalid draft structure, or runtime data that violates the published layout or
external custom object profile.

## 400 Bad Request

Common causes:

- missing `surface`, `mode`, `moduleKey`, `objectKey`, or `formId`;
- unsupported block `type` or `source`;
- block `ref` points to a missing field, relation, or component;
- block is placed in a missing region;
- nested block violates catalog child rules;
- runtime submitted field is not writable;
- relation table query asks for unsupported columns.

Checks:

1. Run `opero --json view-layouts catalog ...` for the exact target and mode.
2. Compare the block to catalog `defaultBlock`.
3. Confirm `regionKey` exists in `regions`.
4. Confirm dynamic object runtime requests include `moduleKey` and `objectKey`.
5. Confirm submitted values use field keys, not labels.

## 403 Forbidden

Common causes:

- missing `api.view_layouts.read`;
- missing `api.view_layouts.manage` for draft or metadata changes;
- missing `api.view_layouts.publish`;
- missing custom form permissions when editing forms;
- missing `api.custom_records.read` or `api.custom_records.write`;
- external custom object profile does not expose the requested operation;
- nested relation target profile does not allow the operation;
- workflow stage blocks editing.

Resolve by checking token permissions, external profile exposure, and workflow
stage rules.

## 404 Not Found

Common causes:

- wrong `moduleKey`, `objectKey`, `formId`, or `layoutId`;
- layout is archived;
- resource belongs to another organization;
- custom object is not exposed through an enabled external profile.

Checks:

1. List forms for the object.
2. Read the form and verify `viewLayoutId`.
3. List layouts for the surface and target.
4. Confirm the token organization.
5. Confirm the custom object profile is enabled.

## 409 Conflict

Common causes:

- publishing a draft with validation errors;
- required built-in block missing;
- required dynamic object field missing for a mode;
- forbidden manual management of a form-owned layout;
- staged field change requires confirmation;
- form type/default constraints would be broken.

Checks:

1. Save draft and inspect `validation.errors`.
2. Add required blocks from the catalog or surface definition.
3. Include `confirmFieldChanges` only after confirmation.
4. Do not create a second layout for a form-owned target.
5. Review form defaults before removing a mode or form type.

## Draft Changes Are Not Visible

Draft saves are not live. To make changes visible:

1. Save the draft.
2. Confirm validation is `valid` or acceptable `valid_with_warnings`.
3. Publish the draft.
4. Resolve runtime again.

## Catalog Entry Does Not Save As Expected

Catalog entries are templates. They become layout blocks only after they are
copied into a draft with stable `id`, `regionKey`, and `displayOrder`.

Preserve required `type`, `source`, `ref`, required flags, and supported modes.

## Runtime Cannot Resolve

For dynamic object resolve, check query flags:

```text
--surface DYNAMIC_OBJECT
--mode CREATE|VIEW|EDIT
--module-key <moduleKey>
--object-key <objectKey>
--form-id <formId>
--record-id <recordId for VIEW or EDIT when needed>
```

If `formId` is omitted, Opero may use defaults when available. Passing `formId`
is clearer when the caller already knows the form.

## Relation Table Saves Fail

Check:

- parent object is exposed and allows the parent operation;
- relation target object is exposed;
- target profile allows nested create/update/delete/read;
- child row fields are writable;
- `clientId` is present for created rows;
- update rows use existing `recordId`;
- delete rows are allowed by target profile.

## Safe Recovery

When a layout is broken:

1. Read the current layout and version list.
2. Inspect the latest published version.
3. Restore a known-good version as draft if needed.
4. Save and inspect validation.
5. Publish after confirmation.
