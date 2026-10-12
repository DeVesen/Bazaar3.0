# Angular Avatar Component — API

Avatar represents people using icons, labels and images.

## Avatar

Avatar represents people using icons, labels and images.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | string \| undefined | - | Defines the text to display. |
| icon | string \| undefined | - | Defines the icon to display. |
| image | string \| undefined | - | Defines the image to display. |
| size | "normal" \| "large" \| "xlarge" | - | Size of the element. |
| shape | "square" \| "circle" | - | Shape of the element. |
| ariaLabel | string \| undefined | - | Establishes a string value that labels the component. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, AvatarPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onImageError | event: Event | This event is triggered if an error occurs while loading an image file. |

## Accessibility

Screen Reader Avatar does not include any roles and attributes by default. Any attribute is passed to the root element so you may add a role like img along with aria-labelledby or aria-label to describe the component. In case avatars need to be tabbable, tabIndex can be added as well to implement custom key handlers. Keyboard Support Component does not include any interactive elements.
