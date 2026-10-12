# Angular Virtual Scroller Component — Beispiele

## Basic

VirtualScroller requires items as the data to display, itemSize for the dimensions of an item and item template are required on component. In addition, an initial array is required based on the total number of items to display. Size of the viewport is configured using scrollWidth , scrollHeight properties directly or with CSS width and height styles.

## Delay

Scroll delay is adjusted by using delay property.

## Grid

Scrolling can be enabled vertically and horizontally when orientation is set as both . In this mode, itemSize should be an array where first value is the height of an item and second is the width.

## Horizontal

Setting orientation to horizontal enables scrolling horizontally. In this case, the itemSize should refer to the width of an item.

## Lazyload

Lazy mode is handy to deal with large datasets where instead of loading the entire data, small chunks of data are loaded on demand by invoking onLazyLoad callback everytime scrolling requires a new chunk. To implement lazy loading, enable lazy attribute, initialize your data as a placeholder with a length and finally implement a method callback using onLazyLoad that actually loads a chunk from a datasource. onLazyLoad gets an event object that contains information about the chunk of data to load such as the index and number of items to load. Notice that a new template called loadingItem is also required to display as a placeholder while the new items are being loaded.

## Loader

Busy state is enabled by adding showLoader property which blocks the UI with a modal by default. Alternatively, loader template can be used to customize items e.g. with Skeleton .

## Programmatic

Scrolling to a specific index can be done with the scrollToIndex function.

## Scroll Options

The properties of scroller component can be used like an object in it.

## Template

Scroller content is customizable by using ng-template . Valid values are content , item , loader and loadericon
