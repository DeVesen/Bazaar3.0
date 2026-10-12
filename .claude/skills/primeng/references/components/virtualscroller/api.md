# Angular Virtual Scroller Component — API

VirtualScroller is a performance-approach to handle huge data efficiently.

## Scroller

Scroller is a performance-approach to handle huge data efficiently.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, VirtualScrollerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| id | string \| undefined | - | Unique identifier of the element. |
| style | any | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the element. |
| tabindex | number | - | Index of the element in tabbing order. |
| items | any[] \| null \| undefined | - | An array of objects to display. |
| itemSize | number \| number[] \| undefined | - | The height/width of item according to orientation. |
| scrollHeight | string \| undefined | - | Height of the scroll viewport. |
| scrollWidth | string \| undefined | - | Width of the scroll viewport. |
| orientation | "both" \| "vertical" \| "horizontal" | - | The orientation of scrollbar. |
| step | number | - | Used to specify how many items to load in each load method in lazy mode. |
| delay | number | - | Delay in scroll before new data is loaded. |
| resizeDelay | number | - | Delay after window's resize finishes. |
| appendOnly | boolean | - | Used to append each loaded item to top without removing any items from the DOM. Using very large data may cause the browser to crash. |
| inline | boolean | - | Specifies whether the scroller should be displayed inline or not. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| disabled | boolean | - | If disabled, the scroller feature is eliminated and the content is displayed directly. |
| loaderDisabled | boolean | - | Used to implement a custom loader instead of using the loader feature in the scroller. |
| columns | any[] \| null \| undefined | - | Columns to display. |
| showSpacer | boolean | - | Used to implement a custom spacer instead of using the spacer feature in the scroller. |
| showLoader | boolean | - | Defines whether to show loader. |
| numToleratedItems | any | - | Determines how many additional elements to add to the DOM outside of the view. According to the scrolls made up and down, extra items are added in a certain algorithm in the form of multiples of this number. Default value is half the number of items shown in the view. |
| loading | boolean \| undefined | - | Defines whether the data is loaded. |
| autoSize | boolean | - | Defines whether to dynamically change the height or width of scrollable container. |
| trackBy | Function \| undefined | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algoritm checks for object identity. |
| options | ScrollerOptions \| undefined | - | Defines whether to use the scroller feature. The properties of scroller component can be used like an object in it. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onLazyLoad | event: ScrollerLazyLoadEvent | Callback to invoke in lazy mode to load new data. |
| onScroll | event: ScrollerScrollEvent | Callback to invoke when scroll position changes. |
| onScrollIndexChange | event: ScrollerScrollIndexChangeEvent | Callback to invoke when scroll position and item's range in view changes. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<ScrollerContentTemplateContext> \| undefined | Content template of the component. |
| item | TemplateRef<ScrollerItemTemplateContext> \| undefined | Item template of the component. |
| loader | TemplateRef<ScrollerLoaderTemplateContext> \| undefined | Loader template of the component. |
| loadericon | TemplateRef<ScrollerLoaderIconTemplateContext> \| undefined | Loader icon template of the component. |

## Accessibility

Screen Reader VirtualScroller uses a semantic list element to list the items. No specific role is enforced, still you may use any aria role and attributes as any valid attribute is passed to the container element. Keyboard Support Component does not include any built-in interactive elements.
