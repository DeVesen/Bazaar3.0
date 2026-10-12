# Angular Speed Dial Component — API

SpeedDial is a floating button with a popup menu.

## Speed Dial

When pressed, a floating action button can display multiple primary actions that can be performed on a page.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SpeedDialPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| id | string \| undefined | - | List of items id. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the element. |
| className | string \| undefined | - | Style class of the element. |
| $model | MenuItem[] \| null | - | MenuModel instance to define the action items. |
| visible | boolean | false | Specifies the visibility of the overlay. |
| transitionDelay | number | - | Transition delay step for each action item. |
| type | "linear" \| "circle" \| "semi-circle" \| "quarter-circle" | - | Specifies the opening type of actions. |
| radius | number | - | Radius for *circle types. |
| mask | boolean | - | Whether to show a mask element behind the speeddial. |
| disabled | boolean | - | Whether the component is disabled. |
| hideOnClickOutside | boolean | - | Whether the actions close when clicked outside. |
| buttonStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the button element. |
| buttonClassName | string \| undefined | - | Style class of the button element. |
| maskStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the mask element. |
| maskClassName | string \| undefined | - | Style class of the mask element. |
| showIcon | string \| undefined | - | Show icon of the button element. |
| hideIcon | string \| undefined | - | Hide icon of the button element. |
| rotateAnimation | boolean | - | Defined to rotate showIcon when hideIcon is not present. |
| ariaLabel | string \| undefined | - | Defines a string value that labels an interactive element. |
| ariaLabelledBy | string \| undefined | - | Identifier of the underlying input element. |
| tooltipOptions | TooltipOptions \| undefined | - | Whether to display the tooltip on items. The modifiers of Tooltip can be used like an object in it. Valid keys are 'event' and 'position'. |
| buttonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the Button component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onVisibleChange | value: boolean | Fired when the visibility of element changed. |
| onClick | event: MouseEvent | Fired when the button element clicked. |
| onShow | value: void | Fired when the actions are visible. |
| onHide | value: void | Fired when the actions are hidden. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| button | TemplateRef<SpeedDialButtonTemplateContext> \| undefined | Custom button template. |
| item | TemplateRef<SpeedDialItemTemplateContext> \| undefined | Custom item template. |
| icon | TemplateRef<void> \| undefined | Custom icon template. |

## Accessibility

Screen Reader SpeedDial component renders a native button element that implicitly includes any passed prop. Text to describe the button can be defined with the aria-labelledby or aria-label props. Addititonally the button includes includes aria-haspopup , aria-expanded for states along with aria-controls to define the relation between the popup and the button. The popup overlay uses menu role on the list and each action item has a menuitem role with an aria-label as the menuitem label. The id of the menu refers to the aria-controls of the button.
