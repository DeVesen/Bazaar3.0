# Angular Toolbar Component — API

Toolbar is a grouping component for buttons and other content.

## Toolbar

Toolbar is a grouping component for buttons and other content.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ToolbarPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| ariaLabelledBy | string \| undefined | - | Defines a string value that labels an interactive element. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| start | TemplateRef<void> \| undefined | Custom start template. |
| end | TemplateRef<void> \| undefined | Custom end template. |
| center | TemplateRef<void> \| undefined | Custom center template. |

## Accessibility

Screen Reader Toolbar uses toolbar role for the root element, aria-orientation is not included as it defaults to horizontal . Any valid attribute is passed to the root element so you may add additional properties like aria-labelledby and aria-labelled to define the element if required. Keyboard Support Component does not include any interactive elements. Arbitrary content can be placed with templating and elements like buttons inside should follow the page tab sequence.
