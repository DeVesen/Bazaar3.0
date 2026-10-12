# Angular Paginator Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| contentStart | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content start's DOM element. |
| current | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the current page report's DOM element. |
| first | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the first page button's DOM element. |
| firstIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the first page button icon's DOM element. |
| prev | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the previous page button's DOM element. |
| prevIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the previous page button icon's DOM element. |
| pages | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the pages container's DOM element. |
| page | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the page button's DOM element. |
| next | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the next page button's DOM element. |
| nextIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the next page button icon's DOM element. |
| last | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the last page button's DOM element. |
| lastIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the last page button icon's DOM element. |
| contentEnd | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content end's DOM element. |
| pcJumpToPageDropdown | SelectPassThrough | Used to pass attributes to the Select component (jump to page dropdown). |
| pcJumpToPageInput | InputNumberPassThrough | Used to pass attributes to the InputNumber component (jump to page input). |
| pcRowPerPageDropdown | SelectPassThrough | Used to pass attributes to the Select component (rows per page dropdown). |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-paginator | Class name of the paginator element |
| p-paginator-content-start | Class name of the content start element |
| p-paginator-content-end | Class name of the content end element |
| p-paginator-first | Class name of the first element |
| p-paginator-first-icon | Class name of the first icon element |
| p-paginator-prev | Class name of the prev element |
| p-paginator-prev-icon | Class name of the prev icon element |
| p-paginator-next | Class name of the next element |
| p-paginator-next-icon | Class name of the next icon element |
| p-paginator-last | Class name of the last element |
| p-paginator-last-icon | Class name of the last icon element |
| p-paginator-pages | Class name of the pages element |
| p-paginator-page | Class name of the page element |
| p-paginator-current | Class name of the current element |
| p-paginator-rpp-dropdown | Class name of the row per page dropdown element |
| p-paginator-jtp-dropdown | Class name of the jump to page dropdown element |
| p-paginator-jtp-input | Class name of the jump to page input element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| paginator.padding | --p-paginator-padding | Padding of root |
| paginator.gap | --p-paginator-gap | Gap of root |
| paginator.border.radius | --p-paginator-border-radius | Border radius of root |
| paginator.background | --p-paginator-background | Background of root |
| paginator.color | --p-paginator-color | Color of root |
| paginator.transition.duration | --p-paginator-transition-duration | Transition duration of root |
| paginator.nav.button.background | --p-paginator-nav-button-background | Background of nav button |
| paginator.nav.button.hover.background | --p-paginator-nav-button-hover-background | Hover background of nav button |
| paginator.nav.button.selected.background | --p-paginator-nav-button-selected-background | Selected background of nav button |
| paginator.nav.button.color | --p-paginator-nav-button-color | Color of nav button |
| paginator.nav.button.hover.color | --p-paginator-nav-button-hover-color | Hover color of nav button |
| paginator.nav.button.selected.color | --p-paginator-nav-button-selected-color | Selected color of nav button |
| paginator.nav.button.width | --p-paginator-nav-button-width | Width of nav button |
| paginator.nav.button.height | --p-paginator-nav-button-height | Height of nav button |
| paginator.nav.button.border.radius | --p-paginator-nav-button-border-radius | Border radius of nav button |
| paginator.nav.button.font.weight | --p-paginator-nav-button-font-weight | Font weight of nav button |
| paginator.nav.button.font.size | --p-paginator-nav-button-font-size | Font size of nav button |
| paginator.nav.button.focus.ring.width | --p-paginator-nav-button-focus-ring-width | Focus ring width of nav button |
| paginator.nav.button.focus.ring.style | --p-paginator-nav-button-focus-ring-style | Focus ring style of nav button |
| paginator.nav.button.focus.ring.color | --p-paginator-nav-button-focus-ring-color | Focus ring color of nav button |
| paginator.nav.button.focus.ring.offset | --p-paginator-nav-button-focus-ring-offset | Focus ring offset of nav button |
| paginator.nav.button.focus.ring.shadow | --p-paginator-nav-button-focus-ring-shadow | Focus ring shadow of nav button |
| paginator.current.page.report.color | --p-paginator-current-page-report-color | Color of current page report |
| paginator.current.page.report.font.weight | --p-paginator-current-page-report-font-weight | Font weight of current page report |
| paginator.current.page.report.font.size | --p-paginator-current-page-report-font-size | Font size of current page report |
| paginator.jump.to.page.input.max.width | --p-paginator-jump-to-page-input-max-width | Max width of jump to page input |

---
