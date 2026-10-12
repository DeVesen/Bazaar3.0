# Angular SplitButton Component — API

SplitButton groups a set of commands in an overlay with a default action item.

## Split Button

SplitButton groups a set of commands in an overlay with a default command.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SplitButtonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model_ | MenuItem[] \| undefined | - | MenuModel instance to define the overlay items. |
| severity | "success" \| "info" \| "warn" \| "danger" \| "help" \| "primary" \| "secondary" \| "contrast" \| null \| undefined | - | Defines the style of the button. |
| raised | boolean | - | Add a shadow to indicate elevation. |
| rounded | boolean | - | Add a circular border radius to the button. |
| text | boolean | - | Add a textual class to the button without a background initially. |
| outlined | boolean | - | Add a border class without a background initially. |
| size | ButtonSize \| undefined | - | Defines the size of the button. |
| plain | boolean | - | Add a plain textual class to the button without a background initially. |
| icon | string \| undefined | - | Name of the icon. |
| iconPos | "left" \| "right" | - | Position of the icon. |
| label | string \| undefined | - | Text of the button. |
| tooltip | string \| undefined | - | Tooltip for the main button. |
| tooltipOptions | TooltipOptions \| undefined | - | Tooltip options for the main button. |
| menuStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the overlay menu. |
| menuStyleClass | string \| undefined | - | Style class of the overlay menu. |
| dropdownIcon | string \| undefined | - | Name of the dropdown icon. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'body' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| dir | string \| undefined | - | Indicates the direction of the element. |
| expandAriaLabel | string \| undefined | - | Defines a string that labels the expand button for accessibility. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| disabled | boolean | - | When present, it specifies that the element should be disabled. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| menuButtonDisabled | boolean | - | When present, it specifies that the menu button element should be disabled. |
| buttonDisabled | boolean | - | When present, it specifies that the button element should be disabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClick | event: MouseEvent | Callback to invoke when default command button is clicked. |
| onMenuHide | value: void | Callback to invoke when overlay menu is hidden. |
| onMenuShow | value: void | Callback to invoke when overlay menu is shown. |
| onDropdownClick | event: MouseEvent | Callback to invoke when dropdown button is clicked. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<void> \| undefined | Custom content template. |
| dropdownicon | TemplateRef<void> \| undefined | Custom dropdown icon template. |

## Accessibility

Screen Reader SplitButton component renders two native button elements. The main button uses the label property to define aria-label by default. Both buttons can be relabelled through the pt (pass-through) API by targeting the pcButton.root and pcDropdown.root sections. The dropdown button also includes aria-haspopup , aria-expanded for states along with aria-controls to define the relation between the popup and the button. The popup overlay uses menu role on the list and each action item has a menuitem role with an aria-label as the menuitem label. The id of the menu refers to the aria-controls of the dropdown button.
