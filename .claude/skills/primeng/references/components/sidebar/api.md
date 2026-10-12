# Angular Sidebar Component — API

Sidebar is a compound navigation panel with collapsible icon mode, offcanvas mode, variants and optional overlay.

## Sidebar

Sidebar is a compound navigation panel with collapsible icon mode, offcanvas mode, variants and optional overlay.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SidebarPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| open | boolean | true | Two-way bound open state. |
| side | "left" \| "right" | 'left' | Side the sidebar attaches to. |
| variant | "sidebar" \| "floating" \| "inset" | 'sidebar' | Visual variant. |
| collapsible | "offcanvas" \| "icon" \| "none" | 'icon' | Collapse mode. |
| overlay | boolean | false | When enabled, the sidebar overlays the inset instead of pushing it. |
| dismissable | boolean | true | Clicking the backdrop closes the sidebar when overlay is active. |
| hideOnOutsideClick | boolean | true | When overlay is active, clicking inside the SidebarMain area collapses the sidebar. Clicks originating from a [pSidebarTrigger] are excluded so opening via the trigger is not immediately undone. |
| width | string | '16rem' | Expanded width (CSS length). |
| iconWidth | string | '3rem' | Icon-mode width (CSS length). |
| openOnHover | boolean | false | Open/close the sidebar on pointer enter/leave of the root. |
| hoverOpenDelay | number | 50 | Delay in ms before opening on hover. |
| hoverCloseDelay | number | 100 | Delay in ms before closing on hover leave. |
| id | string | - | Unique id used by [pSidebarTrigger] target lookup. |

## Accessibility

Screen Reader The sidebar is a navigation landmark. Wrap menus in a &lt;nav&gt; when appropriate and provide an aria-label to describe the region. Menu items render as role="listitem" inside role="list" containers. The pSidebarTrigger directive exposes aria-controls / aria-expanded tied to the sidebar it toggles. When used as an overlay with dismissable , pressing Escape closes the sidebar.
