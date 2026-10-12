# Angular Tabs Component — API

Tabs is a container component to group content with tabs.

## Tabs

Tabs facilitates seamless switching between different views.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TabsPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | string \| number \| undefined | undefined | Value of the active tab. |
| scrollable | boolean | false | Scrolling is enabled by default. This property is no longer needed. **(Deprecated)** |
| lazy | boolean | false | When enabled, tabs are not rendered until activation. |
| selectOnFocus | boolean | false | When enabled, the focused tab is activated. |
| showNavigators | boolean | true | Whether to display navigation buttons in container when scrollable is enabled. |
| tabindex | number | 0 | Tabindex of the tab buttons. |
| scrollStrategy | "nearest" \| "center" \| false | 'nearest' | Defines the scrolling behavior when the active tab changes. Use 'nearest' to scroll only if the tab is not fully visible, 'center' to always center the active tab, or false to disable auto-scrolling. |

## Accessibility

Screen Reader Tabs container is defined with the tablist role, as any attribute is passed to the container element aria-labelledby can be optionally used to specify an element to describe the Tabs. Each tab header has a tab role along with aria-selected state attribute and aria-controls to refer to the corresponding tab content element. The content element of each tab has tabpanel role, an id to match the aria-controls of the header and aria-labelledby reference to the header as the accessible name. Tab Header Keyboard Support Key Function tab Moves focus through the header. enter Activates the focused tab header. space Activates the focused tab header. right arrow Moves focus to the next header. left arrow Moves focus to the previous header. home Moves focus to the last header. end Moves focus to the first header.
