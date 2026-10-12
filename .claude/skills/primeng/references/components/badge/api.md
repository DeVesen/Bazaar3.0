# Angular Badge Component — API

Badge is a small status indicator for another element.

## Badge

Badge is a small status indicator for another element.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| badgeSize | BadgeSize \| undefined | - | Size of the badge, valid options are "large" and "xlarge". |
| size | BadgeSize \| undefined | - | Size of the badge, valid options are "large" and "xlarge". |
| severity | BadgeSeverity \| undefined | - | Severity type of the badge. |
| value | string \| number \| null \| undefined | - | Value to display inside the badge. |
| badgeDisabled | boolean | - | When specified, disables the component. |
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, BadgePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

## Accessibility

Screen Reader Badge does not include any roles and attributes by default, any attribute is passed to the root element so aria roles and attributes can be added if required. If the badges are dynamic, aria-live may be utilized as well. In case badges need to be tabbable, tabIndex can be added to implement custom key handlers. Keyboard Support Component does not include any interactive elements.
