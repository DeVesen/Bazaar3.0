# Angular Breadcrumb Component — API

Breadcrumb provides contextual information about page hierarchy.

## Breadcrumb

Breadcrumb provides contextual information about page hierarchy.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, BreadcrumbPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MenuItem[] \| undefined | - | An array of menuitems. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| home | MenuItem \| undefined | - | MenuItem configuration for the home icon. |
| homeAriaLabel | string \| undefined | - | Defines a string that labels the home icon for accessibility. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onItemClick | event: BreadcrumbItemClickEvent | Fired when an item is selected. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<BreadcrumbItemTemplateContext> \| undefined | Custom item template. |
| separator | TemplateRef<void> \| undefined | Custom separator template. |

## Accessibility

Screen Reader Breadcrumb uses the nav element and since any attribute is passed to the root implicitly aria-labelledby or aria-label can be used to describe the component. Inside an ordered list is used where the list item separators have aria-hidden to be able to ignored by the screen readers. If the last link represents the current route, aria-current is added with "page" as the value. Keyboard Support No special keyboard interaction is needed, all menuitems are focusable based on the page tab sequence.
