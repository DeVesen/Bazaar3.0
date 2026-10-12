# Angular TreeTable Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| loading | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the loading's DOM element. |
| mask | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the mask's DOM element. |
| loadingIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the loading icon's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| pcPaginator | PaginatorPassThrough | Used to pass attributes to the Paginator component. |
| wrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the wrapper's DOM element. |
| table | PassThroughOption<HTMLTableElement, I> | Used to pass attributes to the table's DOM element. |
| thead | PassThroughOption<HTMLTableSectionElement, I> | Used to pass attributes to the thead's DOM element. |
| tbody | PassThroughOption<HTMLTableSectionElement, I> | Used to pass attributes to the tbody's DOM element. |
| tfoot | PassThroughOption<HTMLTableSectionElement, I> | Used to pass attributes to the tfoot's DOM element. |
| footer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the footer's DOM element. |
| scrollableWrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable wrapper's DOM element. |
| scrollableView | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable container's DOM element. |
| scrollableHeader | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable header's DOM element. |
| scrollableHeaderBox | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable header box's DOM element. |
| scrollableHeaderTable | PassThroughOption<HTMLTableElement, I> | Used to pass attributes to the scrollable header table's DOM element. |
| virtualScroller | VirtualScrollerPassThrough | Used to pass attributes to the Scroller component. |
| scrollableBody | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable body's DOM element. |
| scrollableFooter | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable footer's DOM element. |
| scrollableFooterBox | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollable footer box's DOM element. |
| scrollableFooterTable | PassThroughOption<HTMLTableElement, I> | Used to pass attributes to the scrollable footer table's DOM element. |
| columnResizerHelper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the column resizer helper's DOM element. |
| reorderIndicatorUp | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the reorder indicator up's DOM element. |
| reorderIndicatorDown | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the reorder indicator down's DOM element. |
| sortableColumn | PassThroughOption<HTMLTableCellElement, I> | Used to pass attributes to the sortable column's DOM element. |
| sortableColumnIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the sortable column icon's DOM element. |
| pcSortableColumnBadge | BadgePassThrough | Used to pass attributes to the Badge component for sortable column. |
| row | PassThroughOption<HTMLTableRowElement, I> | Used to pass attributes to the row's DOM element. |
| pcRowCheckbox | CheckboxPassThrough | Used to pass attributes to the Checkbox component for row. |
| pcHeaderCheckbox | CheckboxPassThrough | Used to pass attributes to the Checkbox component for header. |
| cellEditor | PassThroughOption<HTMLElement, I> | Used to pass attributes to the cell editor's DOM element. |
| rowToggleButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the row toggle button's DOM element. |
| toggler | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the toggler's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-treetable | Class name of the root element |
| p-treetable-loading | Class name of the loading element |
| p-treetable-mask | Class name of the mask element |
| p-treetable-loading-icon | Class name of the loading icon element |
| p-treetable-header | Class name of the header element |
| p-treetable-paginator-[position] | Class name of the paginator element |
| p-treetable-table-container | Class name of the table container element |
| p-treetable-table | Class name of the table element |
| p-treetable-thead | Class name of the thead element |
| p-treetable-column-resizer | Class name of the column resizer element |
| p-treetable-column-title | Class name of the column title element |
| p-treetable-sort-icon | Class name of the sort icon element |
| p-treetable-sort-badge | Class name of the sort badge element |
| p-treetable-tbody | Class name of the tbody element |
| p-treetable-node-toggle-button | Class name of the node toggle button element |
| p-treetable-node-toggle-icon | Class name of the node toggle icon element |
| p-treetable-node-checkbox | Class name of the node checkbox element |
| p-treetable-empty-message | Class name of the empty message element |
| p-treetable-tfoot | Class name of the tfoot element |
| p-treetable-footer | Class name of the footer element |
| p-treetable-column-resize-indicator | Class name of the column resize indicator element |
| p-treetable-wrapper | Class name of the wrapper element |
| p-treetable-scrollable-wrapper | Class name of the scrollable wrapper element |
| p-treetable-scrollable-view | Class name of the scrollable view element |
| p-treetable-frozen-view | Class name of the frozen view element |
| p-treetable-column-resizer-helper | Class name of the column resizer helper element |
| p-treetable-reorder-indicator-up | Class name of the reorder indicator up element |
| p-treetable-reorder-indicator-down | Class name of the reorder indicator down element |
| p-treetable-scrollable-header | Class name of the scrollable header element |
| p-treetable-scrollable-header-box | Class name of the scrollable header box element |
| p-treetable-scrollable-header-table | Class name of the scrollable header table element |
| p-treetable-scrollable-body | Class name of the scrollable body element |
| p-treetable-scrollable-footer | Class name of the scrollable footer element |
| p-treetable-scrollable-footer-box | Class name of the scrollable footer box element |
| p-treetable-scrollable-footer-table | Class name of the scrollable footer table element |
| p-sortable-column-icon | Class name of the sortable column icon element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| treetable.transition.duration | --p-treetable-transition-duration | Transition duration of root |
| treetable.border.color | --p-treetable-border-color | Border color of root |
| treetable.header.background | --p-treetable-header-background | Background of header |
| treetable.header.border.color | --p-treetable-header-border-color | Border color of header |
| treetable.header.color | --p-treetable-header-color | Color of header |
| treetable.header.border.width | --p-treetable-header-border-width | Border width of header |
| treetable.header.padding | --p-treetable-header-padding | Padding of header |
| treetable.header.cell.background | --p-treetable-header-cell-background | Background of header cell |
| treetable.header.cell.hover.background | --p-treetable-header-cell-hover-background | Hover background of header cell |
| treetable.header.cell.selected.background | --p-treetable-header-cell-selected-background | Selected background of header cell |
| treetable.header.cell.border.color | --p-treetable-header-cell-border-color | Border color of header cell |
| treetable.header.cell.color | --p-treetable-header-cell-color | Color of header cell |
| treetable.header.cell.hover.color | --p-treetable-header-cell-hover-color | Hover color of header cell |
| treetable.header.cell.selected.color | --p-treetable-header-cell-selected-color | Selected color of header cell |
| treetable.header.cell.gap | --p-treetable-header-cell-gap | Gap of header cell |
| treetable.header.cell.padding | --p-treetable-header-cell-padding | Padding of header cell |
| treetable.header.cell.focus.ring.width | --p-treetable-header-cell-focus-ring-width | Focus ring width of header cell |
| treetable.header.cell.focus.ring.style | --p-treetable-header-cell-focus-ring-style | Focus ring style of header cell |
| treetable.header.cell.focus.ring.color | --p-treetable-header-cell-focus-ring-color | Focus ring color of header cell |
| treetable.header.cell.focus.ring.offset | --p-treetable-header-cell-focus-ring-offset | Focus ring offset of header cell |
| treetable.header.cell.focus.ring.shadow | --p-treetable-header-cell-focus-ring-shadow | Focus ring shadow of header cell |
| treetable.column.title.font.weight | --p-treetable-column-title-font-weight | Font weight of column title |
| treetable.column.title.font.size | --p-treetable-column-title-font-size | Font size of column title |
| treetable.row.background | --p-treetable-row-background | Background of row |
| treetable.row.hover.background | --p-treetable-row-hover-background | Hover background of row |
| treetable.row.selected.background | --p-treetable-row-selected-background | Selected background of row |
| treetable.row.color | --p-treetable-row-color | Color of row |
| treetable.row.hover.color | --p-treetable-row-hover-color | Hover color of row |
| treetable.row.selected.color | --p-treetable-row-selected-color | Selected color of row |
| treetable.row.focus.ring.width | --p-treetable-row-focus-ring-width | Focus ring width of row |
| treetable.row.focus.ring.style | --p-treetable-row-focus-ring-style | Focus ring style of row |
| treetable.row.focus.ring.color | --p-treetable-row-focus-ring-color | Focus ring color of row |
| treetable.row.focus.ring.offset | --p-treetable-row-focus-ring-offset | Focus ring offset of row |
| treetable.row.focus.ring.shadow | --p-treetable-row-focus-ring-shadow | Focus ring shadow of row |
| treetable.body.cell.border.color | --p-treetable-body-cell-border-color | Border color of body cell |
| treetable.body.cell.padding | --p-treetable-body-cell-padding | Padding of body cell |
| treetable.body.cell.gap | --p-treetable-body-cell-gap | Gap of body cell |
| treetable.body.cell.selected.border.color | --p-treetable-body-cell-selected-border-color | Selected border color of body cell |
| treetable.body.cell.font.weight | --p-treetable-body-cell-font-weight | Font weight of body cell |
| treetable.body.cell.font.size | --p-treetable-body-cell-font-size | Font size of body cell |
| treetable.footer.cell.background | --p-treetable-footer-cell-background | Background of footer cell |
| treetable.footer.cell.border.color | --p-treetable-footer-cell-border-color | Border color of footer cell |
| treetable.footer.cell.color | --p-treetable-footer-cell-color | Color of footer cell |
| treetable.footer.cell.padding | --p-treetable-footer-cell-padding | Padding of footer cell |
| treetable.column.footer.font.weight | --p-treetable-column-footer-font-weight | Font weight of column footer |
| treetable.column.footer.font.size | --p-treetable-column-footer-font-size | Font size of column footer |
| treetable.footer.background | --p-treetable-footer-background | Background of footer |
| treetable.footer.border.color | --p-treetable-footer-border-color | Border color of footer |
| treetable.footer.color | --p-treetable-footer-color | Color of footer |
| treetable.footer.border.width | --p-treetable-footer-border-width | Border width of footer |
| treetable.footer.padding | --p-treetable-footer-padding | Padding of footer |
| treetable.column.resizer.width | --p-treetable-column-resizer-width | Width of column resizer |
| treetable.resize.indicator.width | --p-treetable-resize-indicator-width | Width of resize indicator |
| treetable.resize.indicator.color | --p-treetable-resize-indicator-color | Color of resize indicator |
| treetable.sort.icon.color | --p-treetable-sort-icon-color | Color of sort icon |
| treetable.sort.icon.hover.color | --p-treetable-sort-icon-hover-color | Hover color of sort icon |
| treetable.sort.icon.size | --p-treetable-sort-icon-size | Size of sort icon |
| treetable.loading.icon.size | --p-treetable-loading-icon-size | Size of loading icon |
| treetable.node.toggle.button.hover.background | --p-treetable-node-toggle-button-hover-background | Hover background of node toggle button |
| treetable.node.toggle.button.selected.hover.background | --p-treetable-node-toggle-button-selected-hover-background | Selected hover background of node toggle button |
| treetable.node.toggle.button.color | --p-treetable-node-toggle-button-color | Color of node toggle button |
| treetable.node.toggle.button.hover.color | --p-treetable-node-toggle-button-hover-color | Hover color of node toggle button |
| treetable.node.toggle.button.selected.hover.color | --p-treetable-node-toggle-button-selected-hover-color | Selected hover color of node toggle button |
| treetable.node.toggle.button.size | --p-treetable-node-toggle-button-size | Size of node toggle button |
| treetable.node.toggle.button.border.radius | --p-treetable-node-toggle-button-border-radius | Border radius of node toggle button |
| treetable.node.toggle.button.focus.ring.width | --p-treetable-node-toggle-button-focus-ring-width | Focus ring width of node toggle button |
| treetable.node.toggle.button.focus.ring.style | --p-treetable-node-toggle-button-focus-ring-style | Focus ring style of node toggle button |
| treetable.node.toggle.button.focus.ring.color | --p-treetable-node-toggle-button-focus-ring-color | Focus ring color of node toggle button |
| treetable.node.toggle.button.focus.ring.offset | --p-treetable-node-toggle-button-focus-ring-offset | Focus ring offset of node toggle button |
| treetable.node.toggle.button.focus.ring.shadow | --p-treetable-node-toggle-button-focus-ring-shadow | Focus ring shadow of node toggle button |
| treetable.paginator.top.border.color | --p-treetable-paginator-top-border-color | Border color of paginator top |
| treetable.paginator.top.border.width | --p-treetable-paginator-top-border-width | Border width of paginator top |
| treetable.paginator.bottom.border.color | --p-treetable-paginator-bottom-border-color | Border color of paginator bottom |
| treetable.paginator.bottom.border.width | --p-treetable-paginator-bottom-border-width | Border width of paginator bottom |

---
