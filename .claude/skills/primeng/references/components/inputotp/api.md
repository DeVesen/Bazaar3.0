# Angular Otp Input Component — API

Input Otp is used to enter one time passwords.

## Input Otp

Input Otp is used to enter one time passwords.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputOtpPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| readonly | boolean | - | When present, it specifies that an input field is read-only. |
| tabindex | number \| null | - | Index of the element in tabbing order. |
| length | number | - | Number of characters to initiate. |
| styleClass | string \| undefined | - | Style class of the input element. |
| mask | boolean | - | Mask pattern. |
| integerOnly | boolean | - | When present, it specifies that an input field is integer-only. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: InputOtpChangeEvent | Callback to invoke on value change. |
| onFocus | event: Event | Callback to invoke when the component receives focus. |
| onBlur | event: Event | Callback to invoke when the component loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| input | TemplateRef<InputOtpInputTemplateContext> \| undefined | Custom input template. |

## Accessibility

Screen Reader Input OTP uses a set of InputText components, refer to the InputText component for more information about the screen reader support.
