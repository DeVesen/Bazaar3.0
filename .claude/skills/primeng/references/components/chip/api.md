# Angular Chip Component — API

Chip represents entities using icons, labels and images.

## Chip

Chip represents people using icons, labels and images.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ChipPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| label | string \| undefined | - | Defines the text to display. |
| icon | string \| undefined | - | Defines the icon to display. |
| image | string \| undefined | - | Defines the image to display. |
| alt | string \| undefined | - | Alt attribute of the image. |
| disabled | boolean | - | When present, it specifies that the element should be disabled. |
| removable | boolean | - | Whether to display a remove icon. |
| removeIcon | string \| undefined | - | Icon of the remove element. |
| chipProps | ChipProps \| undefined | - | Used to pass all properties of the chipProps to the Chip component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onRemove | event: MouseEvent | Callback to invoke when a chip is removed. |
| onImageError | event: Event | This event is triggered if an error occurs while loading an image file. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| removeicon | TemplateRef<void> \| undefined | Custom remove icon template. |

## Accessibility

Screen Reader Chip uses the label property as the default aria-label , since any attribute is passed to the root element aria-labelledby or aria-label can be used to override the default behavior. Removable chips have a tabindex and focusable with the tab key. Keyboard Support Key Function backspace Hides removable. enter Hides removable.
