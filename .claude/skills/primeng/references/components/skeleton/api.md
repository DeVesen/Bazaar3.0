# Angular Skeleton Component — API

Skeleton is a placeholder to display instead of the actual content.

## Skeleton

Skeleton is a placeholder to display instead of the actual content.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SkeletonPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| shape | string | - | Shape of the element. |
| animation | string | - | Type of the animation. |
| borderRadius | string \| undefined | - | Border radius of the element, defaults to value from theme. |
| size | string \| undefined | - | Size of the skeleton. |
| width | string | - | Width of the element. |
| height | string | - | Height of the element. |

## Accessibility

Screen Reader Skeleton uses aria-hidden as "true" so that it gets ignored by screen readers, any valid attribute is passed to the root element so you may customize it further if required. If multiple skeletons are grouped inside a container, you may use aria-busy on the container element as well to indicate the loading process.
