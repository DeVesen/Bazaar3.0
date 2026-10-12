# Angular Splitter Component — API

Splitter is utilized to separate and resize panels.

## Splitter

Splitter is utilized to separate and resize panels.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SplitterPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| panelStyleClass | string \| undefined | - | Style class of the panel. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the panel. |
| stateStorage | "session" \| "local" | - | Defines where a stateful splitter keeps its state, valid values are 'session' for sessionStorage and 'local' for localStorage. |
| stateKey | string \| null | - | Storage identifier of a stateful Splitter. |
| layout | "horizontal" \| "vertical" | - | Orientation of the panels. Valid values are 'horizontal' and 'vertical'. |
| gutterSize | number | - | Size of the divider in pixels. |
| step | number | - | Step factor to increment/decrement the size of the panels while pressing the arrow keys. |
| minSizes | number[] | - | Minimum size of the elements relative to 100%. Used when panels are defined via  `#panel`  templates; when SplitterPanel components are used, the per-panel  `minSize`  input takes precedence. |
| panelSizes | number[] | - | Size of the elements relative to 100%. Used when panels are defined via  `#panel`  templates; when SplitterPanel components are used, the per-panel  `size`  input takes precedence. |
| disabled | boolean | false | When present, it disables the component and prevents resizing. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onResizeEnd | event: SplitterResizeEndEvent | Callback to invoke when resize ends. |
| onResizeStart | event: SplitterResizeStartEvent | Callback to invoke when resize starts. |
| onResize | event: SplitterResizeEvent | Callback to invoke continuously while a gutter is being dragged. |
| onCollapse | event: SplitterCollapseEvent | Callback to invoke when a collapsible panel collapses or expands. |

## Accessibility

Screen Reader Splitter bar defines separator as the role with aria-orientation set to either horizontal or vertical. Keyboard Support Key Function tab Moves focus through the splitter bar. down arrow Moves a vertical splitter down. up arrow Moves a vertical splitter up. left arrow Moves a vertical splitter to the left. right arrow Moves a vertical splitter to the right.
