# Angular Checkbox Component — API

Checkbox is an extension to standard checkbox element with theming.

## Checkbox

Checkbox is an extension to standard checkbox element with theming.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, CheckboxPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| value | any | - | Value of the checkbox. |
| binary | boolean | - | Allows to select a boolean value instead of multiple values. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| ariaLabel | string \| undefined | - | Used to define a string that labels the input element. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| inputStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the input element. |
| inputClass | string \| undefined | - | Style class of the input element. |
| indeterminate | boolean | - | When present, it specifies input state as indeterminate. |
| formControl | FormControl<any> \| undefined | - | Form control value. |
| checkboxIcon | string \| undefined | - | Icon class of the checkbox icon. |
| readonly | boolean | - | When present, it specifies that the component cannot be edited. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| trueValue | any | - | Value in checked state. |
| falseValue | any | - | Value in unchecked state. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: CheckboxChangeEvent | Callback to invoke on value change. |
| onFocus | event: Event | Callback to invoke when the receives focus. |
| onBlur | event: Event | Callback to invoke when the loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| icon | TemplateRef<CheckboxIconTemplateContext> \| undefined | Custom checkbox icon template. |

## Accessibility

Screen Reader Checkbox component uses a hidden native checkbox element internally that is only visible to screen readers. Value to describe the component can either be provided via label tag combined with inputId prop or using ariaLabelledBy , ariaLabel props.
