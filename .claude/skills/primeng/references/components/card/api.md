# Angular Card Component — API

Card is a flexible container component.

## Card

Card is a flexible container component.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, CardPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| header | string \| undefined | - | Header of the card. |
| subheader | string \| undefined | - | Subheader of the card. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Custom header template. |
| title | TemplateRef<void> \| undefined | Custom title template. |
| subtitle | TemplateRef<void> \| undefined | Custom subtitle template. |
| content | TemplateRef<void> \| undefined | Custom content template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |

## Accessibility

Screen Reader A card can be utilized in many use cases as a result no role is enforced, in fact a role may not be necessary if the card is used for presentational purposes only. Any valid attribute is passed to the container element so if you require to use one of the landmark roles like region , you may use the role property. Keyboard Support Component does not include any interactive elements.
