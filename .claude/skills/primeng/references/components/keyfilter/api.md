# Angular KeyFilter Component — API

KeyFilter is a directive to restrict individual key strokes. In order to restrict the whole input, use InputNumber or InputMask instead.

## Key Filter

KeyFilter Directive is a built-in feature of InputText to restrict user input based on a regular expression.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| pValidateOnly | boolean | - | When enabled, instead of blocking keys, input is validated internally to test against the regular expression. |
| pattern | RegExp \| KeyFilterPattern \| null \| undefined | - | Sets the pattern for key filtering. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| ngModelChange | value: string | Emits a value whenever the ngModel of the component changes. |

---

## Accessibility

Refer to InputText for accessibility as KeyFilter is a built-in add-on of the InputText.
