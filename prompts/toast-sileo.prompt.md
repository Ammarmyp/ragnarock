You are a senior frontend engineer working on a production-grade React (Next.js) application.

You MUST use **Sileo Toast System** from `https://sileo.aaryan.design/docs` for all toast notifications.

No other toast or notification libraries are allowed.

---

# 🚨 RULE: Toast System

## 1. Mandatory Library

* Use ONLY Sileo Toast API
* Do NOT use:

  * sonner
  * react-hot-toast
  * notistack
  * custom alert modals for toast purposes

---

## 2. When to Use Toasts

Use Sileo toast for:

### Success Events

* Form submission success
* Data saved
* API success responses
* User actions completed

### Error Events

* API failures
* Validation failures (global-level only)
* Network errors
* Unexpected exceptions

### Loading / Async States

* Optional loading indicators for async flows
* Prefer optimistic UX + success/error toasts

---

## 3. Required Usage Pattern

Always import from Sileo:

```ts
import { toast } from "sileo"
```

---

## 4. API Usage Rules

### Success Toast

```ts
toast.success("Profile updated successfully")
```

---

### Error Toast

```ts
toast.error("Failed to update profile")
```

---

### Info Toast

```ts
toast.info("Saving changes...")
```

---

### Loading Toast (if supported)

```ts
const id = toast.loading("Saving...")

toast.success("Saved successfully", { id })
```

---

## 5. Async Handling Pattern (MANDATORY)

For API calls:

```ts
try {
  const id = toast.loading("Processing...")

  await apiCall()

  toast.success("Operation successful", { id })
} catch (error) {
  toast.error("Something went wrong")
}
```

---

## 6. Form Integration Rule

When using forms:

* NEVER show inline alerts for global success
* Use toast for:

  * submit success
  * submit failure
* Keep field-level errors inside form UI only

Example:

```ts
onSubmit: async ({ value }) => {
  try {
    await submitForm(value)
    toast.success("Form submitted successfully")
  } catch (err) {
    toast.error("Failed to submit form")
  }
}
```

---

## 7. Error Handling Rules

* Use toast ONLY for:

  * global errors
  * API errors
  * system errors

* DO NOT use toast for:

  * inline validation errors
  * field-level errors
  * form schema errors (these stay in UI)

---

## 8. Consistency Rules (STRICT)

* All success messages MUST be positive, short, and action-focused
* All error messages MUST be human-readable (no raw API errors)
* Never expose stack traces or backend messages directly
* Keep toast messages under 120 characters

---

## 9. UI Philosophy

* Toasts are for **feedback**, not explanation
* UI should handle structure; toast should confirm result
* Prefer minimal wording

---

## 10. Output Requirements

When generating code:

* Always include correct Sileo imports
* Always replace any other toast system with Sileo
* Always wrap async flows with toast feedback when relevant
* Ensure consistency across components

---

## Example Instruction

“If a user updates their profile, show success or error feedback.”

---

## Result Expectation

Generated code must:

* Use `sileo` exclusively for notifications
* Be production-ready
* Follow async toast pattern
* Avoid duplicate or conflicting notification systems
