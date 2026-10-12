# Angular InputMask Component — API

InputMask component is used to enter input in a certain format such as numeric, date, currency and phone.

## Input Mask

InputMask component is used to enter input in a certain format such as numeric, date, currency, email and phone.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputMaskPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| fluid | boolean \| undefined | false | Spans 100% width of the container when enabled. |
| variant | "filled" \| "outlined" \| undefined | 'outlined' | Specifies the input variant of the component. |
| size | "small" \| "large" \| undefined | undefined | Specifies the size of the component. |
| inputSize | number \| null \| undefined | undefined | Specifies the visible width of the input element in characters. |
| pattern | string \| readonly RegExp[] \| null \| undefined | undefined | Specifies the value must match the pattern. |
| min | string \| null \| undefined | undefined | The value must be greater than or equal to the value. |
| max | string \| null \| undefined | undefined | The value must be less than or equal to the value. |
| step | number \| null \| undefined | undefined | Unless the step is set to the any literal, the value must be min + an integral multiple of the step. |
| minlength | number \| null \| undefined | undefined | The number of characters (code points) must not be less than the value of the attribute, if non-empty. |
| maxlength | number \| null \| undefined | undefined | The number of characters (code points) must not exceed the value of the attribute. |
| type | string | - | HTML5 input type. |
| slotChar | string | - | Placeholder character in mask, default is underscore. |
| autoClear | boolean | - | Clears the incomplete value on blur. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the input field. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| styleClass | string \| undefined | - | Style class of the input field. |
| placeholder | string \| undefined | - | Advisory information to display on input. |
| tabindex | string \| undefined | - | Specifies tab order of the element. |
| title | string \| undefined | - | Title text of the input text. |
| ariaLabel | string \| undefined | - | Used to define a string that labels the input element. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| ariaRequired | boolean \| undefined | - | Used to indicate that user input is required on an element before a form can be submitted. |
| readonly | boolean | - | When present, it specifies that an input field is read-only. |
| unmask | boolean | - | Defines if ngModel sets the raw unmasked value to bound value or the formatted mask value. |
| characterPattern | string | - | Regex pattern for alpha characters |
| autofocus | boolean | - | When present, the input gets a focus automatically on load. |
| autocomplete | string \| undefined | - | Used to define a string that autocomplete attribute the current element. |
| keepBuffer | boolean | - | When present, it specifies that whether to clean buffer value from model. |
| keepCharPositions | boolean | - | When enabled, deleting a character does not shift the following characters across literal separators (e.g. the "." in 99.99.9999), keeping each mask section independent. |
| mask | string \| null \| undefined | - | Mask pattern. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onComplete | value: void | Callback to invoke when the mask is completed. |
| onFocus | event: Event | Callback to invoke when the component receives focus. |
| onBlur | event: Event | Callback to invoke when the component loses focus. |
| onInput | event: Event | Callback to invoke on input. |
| onKeydown | event: Event | Callback to invoke on input key press. |
| onClear | value: void | Callback to invoke when input field is cleared. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |

## Accessibility

Screen Reader InputMask directive is used with a native input element that implicitly includes any passed attribute. Value to describe the component can either be provided via label tag combined with id attribute or using aria-labelledby , aria-label attributes.
