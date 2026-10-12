# Angular Tag Component — API

Tag component is used to categorize content.

## Tag

Tag component is used to categorize content.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TagPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| severity | TagSeverity \| null \| undefined | - | Severity type of the tag. |
| value | string \| undefined | - | Value to display inside the tag. |
| icon | string \| undefined | - | Icon of the tag to display next to the value. |
| rounded | boolean | - | Whether the corners of the tag are rounded. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| icon | TemplateRef<void> \| undefined | Custom icon template. |

## Accessibility

Screen Reader Tag does not include any roles and attributes by default, any attribute is passed to the root element so aria roles and attributes can be added if required. If the tags are dynamic, aria-live may be utilized as well. In case badges need to be tabbable, tabIndex can be added to implement custom key handlers. Keyboard Support Component does not include any interactive elements.
