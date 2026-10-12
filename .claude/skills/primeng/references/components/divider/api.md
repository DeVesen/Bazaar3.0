# Angular Divider Component — API

Divider is used to separate contents.

## Divider

Divider is used to separate contents.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DividerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| layout | "horizontal" \| "vertical" | - | Specifies the orientation. |
| type | "solid" \| "dashed" \| "dotted" | - | Border style type. |
| align | DividerAlign \| undefined | - | Alignment of the content. |

## Accessibility

Screen Reader Divider uses a separator role with aria-orientation set to either "horizontal" or "vertical". Keyboard Support Component does not include any interactive elements.
