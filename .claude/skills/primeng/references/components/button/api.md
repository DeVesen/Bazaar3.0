# Angular Button Component — API

Button is an extension to standard button element with icons and theming.

## Button

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ButtonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| type | string | - | Type of the button. |
| badge | string \| undefined | - | Value of the badge. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |
| raised | boolean | - | Add a shadow to indicate elevation. |
| rounded | boolean | - | Add a circular border radius to the button. |
| text | boolean | - | Add a textual class to the button without a background initially. |
| plain | boolean | - | Add a plain textual class to the button without a background initially. |
| outlined | boolean | - | Add a border class without a background initially. |
| link | boolean | - | Add a link style to the button. |
| tabindex | number | - | Add a tabindex to the button. |
| size | ButtonSize \| undefined | - | Defines the size of the button. |
| variant | ButtonVariant \| undefined | - | Specifies the variant of the component. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the element. |
| styleClass | string \| undefined | - | Class of the element. |
| badgeSeverity | "secondary" \| "info" \| "success" \| "warn" \| "danger" \| "contrast" \| null | secondary | Severity type of the badge. |
| ariaLabel | string \| undefined | - | Used to define a string that autocomplete attribute the current element. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| iconPos | "left" \| "right" \| "top" \| "bottom" | - | Position of the icon. |
| icon | string \| undefined | - | Name of the icon. |
| label | string \| undefined | - | Text of the button. |
| loading | boolean | - | Whether the button is in loading state. |
| loadingIcon | string \| undefined | - | Icon to display in loading state. |
| severity | "success" \| "info" \| "warn" \| "danger" \| "help" \| "primary" \| "secondary" \| "contrast" \| null \| undefined | - | Defines the style of the button. |
| buttonProps | ButtonProps \| undefined | - | Used to pass all properties of the ButtonProps to the Button component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| iconOnly | boolean | - | Forces icon-only styling regardless of content. When unset, icon-only is inferred from the absence of a label/badge. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClick | event: MouseEvent | Callback to execute when button is clicked. This event is intended to be used with the <p-button> component. Using a regular <button> element, use (click). |
| onFocus | event: FocusEvent | Callback to execute when button is focused. This event is intended to be used with the <p-button> component. Using a regular <button> element, use (focus). |
| onBlur | event: FocusEvent | Callback to execute when button loses focus. This event is intended to be used with the <p-button> component. Using a regular <button> element, use (blur). |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<void> \| undefined | Custom content template. |
| loadingicon | TemplateRef<ButtonLoadingIconTemplateContext> \| undefined | Custom loading icon template. |
| icon | TemplateRef<ButtonIconTemplateContext> \| undefined | Custom icon template. |

## Accessibility

Screen Reader Button component renders a native button element that implicitly includes any passed prop. Text to describe the button is defined with the aria-label prop, if not present label prop is used as the value. If the button is icon only or custom templating is used, it is recommended to use aria-label so that screen readers would be able to read the element properly.
