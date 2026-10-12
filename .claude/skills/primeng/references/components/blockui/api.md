# Angular BlockUI Component — API

BlockUI can either block other components or the whole page.

## Block U I

BlockUI can either block other components or the whole page.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, BlockUIPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| target | any | - | Name of the local ng-template variable referring to another component. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| blocked | boolean | - | Current blocked state as a boolean. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<any> \| undefined | Template of the content. |

## Accessibility

Screen Reader BlockUI manages aria-busy state attribute when the UI gets blocked and unblocked. Any valid attribute is passed to the root element so additional attributes like role and aria-live can be used to define live regions. Keyboard Support Component does not include any interactive elements.
