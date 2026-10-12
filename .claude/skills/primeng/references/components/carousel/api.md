# Angular Carousel Component — API

Carousel is a content slider featuring various customization options.

## Carousel

Carousel is a content slider featuring various customization options.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | any | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| page | number | 0 | Index of the first item. |
| numVisible | number | 1 | Number of items per page. |
| numScroll | number | 1 | Number of items to scroll. |
| responsiveOptions | CarouselResponsiveOptions[] \| undefined | - | An array of options for responsive design. |
| orientation | "horizontal" \| "vertical" | - | Specifies the layout of the component. |
| verticalViewPortHeight | string | - | Height of the viewport in vertical layout. |
| contentClass | string | - | Style class of main content. |
| indicatorsContentClass | string | - | Style class of the indicator items. |
| indicatorsContentStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the indicator items. |
| indicatorStyleClass | string | - | Style class of the indicators. |
| indicatorStyle | { [klass: string]: any } \| null \| undefined | - | Style of the indicators. |
| value | any[] \| undefined | null | An array of objects to display. |
| circular | boolean | - | Defines if scrolling would be infinite. |
| showIndicators | boolean | - | Whether to display indicator container. |
| showNavigators | boolean | - | Whether to display navigation buttons in container. |
| autoplayInterval | number | - | Time in milliseconds to scroll items automatically. |
| prevButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the underlying button. |
| nextButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the underlying button. |
| align | "center" \| "start" \| "end" | 'start' | Alignment of the carousel items (composition mode). |
| loop | boolean | false | Whether the carousel should loop (composition mode). |
| snapType | "mandatory" \| "proximity" | 'mandatory' | Scroll snap type applied to the track (composition mode). |
| spacing | number | 16 | Spacing between carousel items in pixels (composition mode). |
| autoSize | boolean | false | Whether the carousel should auto size items (composition mode). |
| slidesPerPage | number | 1 | How many slides are visible per page (composition mode). Supports fractions (e.g. 1.5). |
| slide | number \| undefined | - | Index of the active slide (composition mode). |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onPage | event: CarouselPageEvent | Callback to invoke after scroll. |
| onPageChange | value: { value: number } | Callback fired when the carousel's page changes (composition mode). |
| onSlideChange | value: { value: number } | Callback fired when the active slide changes (composition mode). |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<CarouselItemTemplateContext<any>> \| undefined | Custom item template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| previousicon | TemplateRef<void> \| undefined | Custom previous icon template. |
| nexticon | TemplateRef<void> \| undefined | Custom next icon template. |

## Accessibility

Screen Reader Carousel uses region role and since any attribute is passed to the main container element, attributes such as aria-label and aria-roledescription can be used as well. The slides container has aria-live attribute set as "polite" if carousel is not in autoplay mode, otherwise "off" would be the value in autoplay. A slide has a group role with an aria-label that refers to the aria.slideNumber property of the locale API. Similarly aria.slide is used as the aria-roledescription of the item. Inactive slides are hidden from the readers with aria-hidden . Next and Previous navigators are button elements with aria-label attributes referring to the aria.nextPageLabel and aria.firstPageLabel properties of the locale API by default respectively, you may still use your own aria roles and attributes as any valid attribute is passed to the button elements implicitly by using nextButtonProps and prevButtonProps . Quick navigation elements are button elements with an aria-label attribute referring to the aria.pageLabel of the locale API. Current page is marked with aria-current . Next/Prev Keyboard Support Key Function tab Moves focus through interactive elements in the carousel. enter Activates navigation. space Activates navigation. Quick Navigation Keyboard Support Key Function tab Moves focus through the active slide link. enter Activates the focused slide link. space Activates the focused slide link. right arrow Moves focus to the next slide link. left arrow Moves focus to the previous slide link. home Moves focus to the first slide link. end Moves focus to the last slide link.
