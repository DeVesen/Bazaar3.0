# Angular Scroll Area Component — API

ScrollArea is a cross browser, lightweight and themable alternative to native browser scrollbar.

## Scroll Area

ScrollArea is a cross browser, lightweight and themable alternative to native browser scrollbar.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ScrollAreaPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| variant | "auto" \| "hover" \| "scroll" \| "always" \| "hidden" | - | Scrollbar visibility variant. |
| mask | boolean | - | Whether to show gradient mask at scroll edges. |
| tabindex | number | 0 | Tabindex of the viewport when content overflows. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| refresh |  | void | Refreshes the position and size of the scrollbar. |

## Accessibility

ScrollArea uses a scrollbar role for the scrollbar elements with aria-orientation set to the scrollbar direction.
