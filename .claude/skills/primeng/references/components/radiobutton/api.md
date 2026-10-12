# Angular RadioButton Component — API

RadioButton is an extension to standard radio button element with theming.

## Radio Button

RadioButton is an extension to standard radio button element with theming.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, RadioButtonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| value | any | - | Value of the radiobutton. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| ariaLabel | string \| undefined | - | Used to define a string that labels the input element. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| binary | boolean | - | Allows to select a boolean value. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClick | event: RadioButtonClickEvent | Callback to invoke on radio button click. |
| onFocus | event: Event | Callback to invoke when the receives focus. |
| onBlur | event: Event | Callback to invoke when the loses focus. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| focus |  | void | Applies focus to input field. |

## Accessibility

Screen Reader RadioButton component uses a hidden native radio button element internally that is only visible to screen readers. Value to describe the component can either be provided via label tag combined with inputId prop or using ariaLabelledBy , ariaLabel props.
