# Angular ToggleSwitch Component — API

ToggleSwitch is used to select a boolean value.

## Toggle Switch

ToggleSwitch is used to select a boolean value.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ToggleSwitchPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| inputId | string \| undefined | - | Identifier of the input element. |
| readonly | boolean | - | When present, it specifies that the component cannot be edited. |
| trueValue | any | - | Value in checked state. |
| falseValue | any | - | Value in unchecked state. |
| ariaLabel | string \| undefined | - | Used to define a string that autocomplete attribute the current element. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: ToggleSwitchChangeEvent | Callback to invoke when the on value change. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| handle | TemplateRef<ToggleSwitchHandleTemplateContext> \| undefined | Custom handle template. |

## Accessibility

Screen Reader InputSwitch component uses a hidden native checkbox element with switch role internally that is only visible to screen readers. Value to describe the component can either be provided via label tag combined with inputId prop or using ariaLabelledBy , ariaLabel props.
