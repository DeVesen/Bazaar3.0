# Angular Accordion Component — API

Accordion groups a collection of contents in tabs.

## Accordion

Accordion groups a collection of contents in tabs.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | string \| number \| (string \| number)[] \| null \| undefined | undefined | Value of the active tab. |
| multiple | boolean | false | When enabled, multiple tabs can be activated at the same time. |
| expandIcon | string \| undefined | - | Icon of a collapsed tab. |
| collapseIcon | string \| undefined | - | Icon of an expanded tab. |
| selectOnFocus | boolean | false | When enabled, the focused tab is activated. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, AccordionPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClose | event: AccordionTabCloseEvent | Callback to invoke when an active tab is collapsed by clicking on the header. |
| onOpen | event: AccordionTabOpenEvent | Callback to invoke when a tab gets expanded. |

## Accessibility

Screen Reader Accordion header elements have a button role and use aria-controls to define the id of the content section along with aria-expanded for the visibility state. The value to read a header element defaults to the value of the header property and can be customized by defining an aria-label or aria-labelledby property. Each header has a heading role, for which the level is customized by headerAriaLevel and has a default level of 2 as per W3C specifications. Disabled accordions headers use aria-disabled and are excluded from the keybord navigation. The content uses region role, defines an id that matches the aria-controls of the header and aria-labelledby referring to the id of the header. Header Keyboard Support
