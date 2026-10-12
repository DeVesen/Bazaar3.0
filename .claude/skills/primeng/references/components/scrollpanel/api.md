# Angular Scroll Panel Component — API

ScrollPanel is a cross browser, lightweight and skinnable alternative to native browser scrollbar.

## Scroll Panel

ScrollPanel is a cross browser, lightweight and themable alternative to native browser scrollbar.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ScrollPanelPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| step | number | - | Step factor to scroll the content while pressing the arrow keys. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<void> \| undefined | Custom content template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| scrollTop | scrollTop: number | void | Scrolls the top location to the given value. |
| refresh |  | void | Refreshes the position and size of the scrollbar. |

## Accessibility

Screen Reader Scrollbars of the ScrollPanel has a scrollbar role along with the aria-controls attribute that refers to the id of the scrollable content container and the aria-orientation to indicate the orientation of scrolling. Header Keyboard Support Key Function down arrow Scrolls content down when vertical scrolling is available. up arrow Scrolls content up when vertical scrolling is available. left Scrolls content left when horizontal scrolling is available. right Scrolls content right when horizontal scrolling is available.
